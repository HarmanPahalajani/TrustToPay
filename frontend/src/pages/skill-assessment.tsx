import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Award,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ScreenShare,
  ShieldCheck,
  Video,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Flag,
  FileCode,
  ListChecks,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingBlock } from "@/components/ui/states";
import type { SkillAssessmentQuestion, SkillAssessmentAttemptResult } from "@/lib/types";

type AssessmentState = "PREFLIGHT" | "IN_PROGRESS" | "SUBMITTED" | "ERROR";

export default function SkillAssessmentPage() {
  const { skillSlug = "typescript", level = "1" } = useParams();
  const levelNum = Number(level) || 1;
  const navigate = useNavigate();

  // State management
  const [stageState, setStageState] = useState<AssessmentState>("PREFLIGHT");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Proctoring States
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [screenActive, setScreenActive] = useState<boolean>(false);
  const [isSimulatedProctoring, setIsSimulatedProctoring] = useState<boolean>(false);
  const [proctoringAgreement, setProctoringAgreement] = useState<boolean>(false);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState<number>(0);
  const [isTabFocused, setIsTabFocused] = useState<boolean>(true);

  // Stream Interruption & Grace Period
  const [isInterrupted, setIsInterrupted] = useState<boolean>(false);
  const [interruptionGraceSeconds, setInterruptionGraceSeconds] = useState<number>(45);

  // Assessment Question Data
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [skillInfo, setSkillInfo] = useState<{
    skillName: string;
    levelName: string;
    passingScore: number;
  }>({
    skillName: "TypeScript",
    levelName: "Level 1 — Foundation",
    passingScore: 80,
  });
  const [questions, setQuestions] = useState<SkillAssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(1800); // 30 minutes default
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [attemptResult, setAttemptResult] = useState<SkillAssessmentAttemptResult | null>(null);

  // Video Preview DOM references
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  // 1. Camera Initialization
  const requestCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("MediaDevices API is unavailable in this environment.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      setCameraStream(stream);
      setCameraActive(true);

      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }

      // Stream termination listener
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setCameraActive(false);
          if (stageState === "IN_PROGRESS" && !isSimulatedProctoring) {
            setIsInterrupted(true);
            if (attemptId) {
              api.skills.logProctoringEvent(attemptId, { type: "CAMERA_PAUSED" }).catch(() => {});
            }
          }
        };
      }

      if (isInterrupted && (screenActive || isSimulatedProctoring)) {
        setIsInterrupted(false);
        setInterruptionGraceSeconds(45);
        if (attemptId) {
          api.skills.logProctoringEvent(attemptId, { type: "CAMERA_RESUMED" }).catch(() => {});
        }
      }
    } catch (err: unknown) {
      console.warn("Camera access failed or was denied:", err);
      setCameraActive(false);
    }
  };

  // 2. Screen Sharing Initialization
  const requestScreenShare = async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error("Screen sharing is not supported in this browser.");
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" as unknown as undefined },
      });
      setScreenStream(stream);
      setScreenActive(true);

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }

      const screenTrack = stream.getVideoTracks()[0];
      if (screenTrack) {
        screenTrack.onended = () => {
          setScreenActive(false);
          if (stageState === "IN_PROGRESS" && !isSimulatedProctoring) {
            setIsInterrupted(true);
            if (attemptId) {
              api.skills.logProctoringEvent(attemptId, { type: "SCREEN_PAUSED" }).catch(() => {});
            }
          }
        };
      }

      if (isInterrupted && (cameraActive || isSimulatedProctoring)) {
        setIsInterrupted(false);
        setInterruptionGraceSeconds(45);
        if (attemptId) {
          api.skills.logProctoringEvent(attemptId, { type: "SCREEN_RESUMED" }).catch(() => {});
        }
      }
    } catch (err: unknown) {
      console.warn("Screen share request rejected:", err);
      setScreenActive(false);
    }
  };

  // Enable simulated proctoring for environments without real physical hardware
  const enableSimulatedProctoring = () => {
    setIsSimulatedProctoring(true);
    setCameraActive(true);
    setScreenActive(true);
    setIsInterrupted(false);
  };

  // 3. Tab Visibility & Blur Tracking for Proctoring Integrity
  useEffect(() => {
    if (stageState !== "IN_PROGRESS") return;

    const handleBlur = () => {
      setIsTabFocused(false);
      setTabSwitchWarnings((prev) => {
        const next = prev + 1;
        if (attemptId) {
          api.skills
            .logProctoringEvent(attemptId, {
              type: "TAB_BLUR",
              details: { warningCount: next },
            })
            .catch(() => {});
        }
        return next;
      });
    };

    const handleFocus = () => {
      setIsTabFocused(true);
      if (attemptId) {
        api.skills.logProctoringEvent(attemptId, { type: "TAB_FOCUS" }).catch(() => {});
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleBlur();
      } else {
        handleFocus();
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [stageState, attemptId]);

  // 4. Timer Countdown (Pauses automatically during stream interruption)
  useEffect(() => {
    if (stageState !== "IN_PROGRESS" || isInterrupted || timeRemainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stageState, isInterrupted, timeRemainingSeconds]);

  // 5. Interruption Grace Period Countdown
  useEffect(() => {
    if (stageState !== "IN_PROGRESS" || !isInterrupted) return;

    const graceTimer = setInterval(() => {
      setInterruptionGraceSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(graceTimer);
          setStageState("ERROR");
          setErrorMessage(
            "Camera or screen sharing was not restored within 45 seconds. Please restart this skill check.",
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(graceTimer);
  }, [stageState, isInterrupted]);

  // Link camera to PIP video element once in progress
  useEffect(() => {
    if (stageState === "IN_PROGRESS" && pipVideoRef.current && cameraStream) {
      pipVideoRef.current.srcObject = cameraStream;
    }
  }, [stageState, cameraStream]);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((t) => t.stop());
      screenStream?.getTracks().forEach((t) => t.stop());
    };
  }, [cameraStream, screenStream]);

  // Start Assessment API Call
  const handleStartAssessment = async () => {
    setErrorMessage(null);
    try {
      const response = await api.skills.startAssessment(skillSlug, levelNum);
      setAttemptId(response.attempt.id);
      setSkillInfo({
        skillName: response.attempt.skillName,
        levelName: response.attempt.levelName,
        passingScore: response.attempt.passingScore,
      });
      setQuestions(response.questions);

      // Initialize default answers with starter codes if present
      const initialAnswers: Record<string, string> = {};
      response.questions.forEach((q) => {
        if (q.starterCode) {
          initialAnswers[q.id] = q.starterCode;
        }
      });
      setAnswers(initialAnswers);

      setStageState("IN_PROGRESS");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initialize assessment session.";
      setErrorMessage(msg);
      setStageState("ERROR");
    }
  };

  // Submit Answer update
  const handleUpdateAnswer = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  // Toggle Flag
  const toggleFlagQuestion = (index: number) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Submit Attempt
  const handleFinalSubmit = async () => {
    if (!attemptId) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await api.skills.submitAttempt(attemptId, answers);
      setAttemptResult(result.attempt);
      setStageState("SUBMITTED");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please retry.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const canProceedToNext = currentQuestionIndex < questions.length - 1;
  const canProceedToPrev = currentQuestionIndex > 0;

  // ----------------------------------------------------
  // PREFLIGHT VIEW: Camera, Screen and Policy Verification
  // ----------------------------------------------------
  if (stageState === "PREFLIGHT") {
    const allChecksPassed = (cameraActive && screenActive) || isSimulatedProctoring;

    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/app/onboarding/skills"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#69736D] hover:text-[#202722]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Skills
          </Link>
          <span className="text-xs font-medium text-[#69736D]">
            Check setup
          </span>
        </div>

        <div className="rounded-2xl border border-[#E5E1D7] bg-[#FFFEFA] p-6 shadow-sm sm:p-8">
          <div className="border-b border-[#E5E1D7] pb-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#365FEA]/10 px-3 py-1 text-xs font-semibold text-[#365FEA]">
              <ShieldCheck className="h-4 w-4" />
              Verified Skill Check
            </span>
            <h1 className="font-heading mt-3 text-2xl font-bold tracking-tight text-[#202722] sm:text-3xl">
              Quick Check Setup: {skillSlug.toUpperCase()} (Level {levelNum})
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#69736D]">
              Skill checks confirm your camera and screen sharing before you begin so every specialist earns verified
              credentials fairly.
            </p>
          </div>

          {errorMessage && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Verification Steps Grid */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 1. Camera Verification Card */}
            <div className="flex flex-col justify-between rounded-xl border border-[#E5E1D7] bg-[#F0EEE7] p-5">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#202722]">
                    <Camera className="h-4 w-4 text-[#365FEA]" />
                    <span>1. Camera feed</span>
                  </div>
                  {cameraActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2E6248]">
                      <CheckCircle2 className="h-4 w-4" /> Active
                    </span>
                  ) : (
                    <span className="text-xs text-[#69736D]">Required</span>
                  )}
                </div>

                <p className="mt-2 text-xs text-[#69736D]">
                  Keep your camera active so you remain clearly visible while completing your skill check.
                </p>

                {/* Camera Viewport */}
                <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg border border-[#E5E1D7] bg-black/5 flex items-center justify-center">
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`h-full w-full object-cover ${cameraActive ? "block" : "hidden"}`}
                  />
                  {!cameraActive && (
                    <div className="flex flex-col items-center gap-2 text-center p-4">
                      <Video className="h-8 w-8 text-[#69736D]/60" />
                      <span className="text-xs text-[#69736D]">Camera not connected</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3">
                <Button
                  variant={cameraActive ? "outline" : "default"}
                  size="sm"
                  className={`w-full text-xs font-semibold ${
                    cameraActive
                      ? "border-[#438866] text-[#2E6248] bg-[#FFFEFA] hover:bg-[#438866]/10"
                      : "bg-[#365FEA] text-white hover:bg-[#2949C6]"
                  }`}
                  onClick={requestCamera}
                >
                  {cameraActive ? "Reconnect Camera" : "Enable Camera"}
                </Button>
              </div>
            </div>

            {/* 2. Screen Share Verification Card */}
            <div className="flex flex-col justify-between rounded-xl border border-[#E5E1D7] bg-[#F0EEE7] p-5">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#202722]">
                    <ScreenShare className="h-4 w-4 text-[#2E6248]" />
                    <span>2. Screen sharing</span>
                  </div>
                  {screenActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2E6248]">
                      <CheckCircle2 className="h-4 w-4" /> Sharing
                    </span>
                  ) : (
                    <span className="text-xs text-[#69736D]">Required</span>
                  )}
                </div>

                <p className="mt-2 text-xs text-[#69736D]">
                  Share your screen and stay on this page while answering questions.
                </p>

                {/* Screen Preview Viewport */}
                <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg border border-[#E5E1D7] bg-black/5 flex items-center justify-center">
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`h-full w-full object-cover ${screenActive ? "block" : "hidden"}`}
                  />
                  {!screenActive && (
                    <div className="flex flex-col items-center gap-2 text-center p-4">
                      <ScreenShare className="h-8 w-8 text-[#69736D]/60" />
                      <span className="text-xs text-[#69736D]">Screen sharing not started</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3">
                <Button
                  variant={screenActive ? "outline" : "default"}
                  size="sm"
                  className={`w-full text-xs font-semibold ${
                    screenActive
                      ? "border-[#438866] text-[#2E6248] bg-[#FFFEFA] hover:bg-[#438866]/10"
                      : "bg-[#438866] text-white hover:bg-[#356F52]"
                  }`}
                  onClick={requestScreenShare}
                >
                  {screenActive ? "Re-share Screen" : "Share Screen"}
                </Button>
              </div>
            </div>
          </div>

          {/* Dev/Testing Mode fallback */}
          {!allChecksPassed && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-dashed border-[#E5E1D7] p-3 text-xs text-[#69736D]">
              <span>No camera or screen sharing available on this device?</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={enableSimulatedProctoring}
                className="text-xs text-[#365FEA] hover:underline"
              >
                Continue without camera/screen
              </Button>
            </div>
          )}

          {/* Policy Agreement Checkbox */}
          <div className="mt-6 rounded-xl border border-[#E5E1D7] bg-[#FFFEFA] p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={proctoringAgreement}
                onChange={(e) => setProctoringAgreement(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#E5E1D7] text-[#365FEA] focus:ring-[#365FEA]"
              />
              <span className="text-xs leading-relaxed text-[#202722]">
                <strong>Skill Check Agreement:</strong> I confirm that I will complete this check independently
                and stay on this page until submission.
              </span>
            </label>
          </div>

          {/* Launch Assessment Action */}
          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-[#E5E1D7] pt-5 sm:flex-row">
            <div className="text-xs text-[#69736D]">
              Estimated time: <strong>30 minutes</strong> | Passing score: <strong>80%</strong>
            </div>

            <Button
              variant="default"
              size="lg"
              disabled={!allChecksPassed || !proctoringAgreement}
              onClick={handleStartAssessment}
              className="w-full sm:w-auto bg-[#365FEA] text-white hover:bg-[#2949C6] disabled:opacity-50 text-sm font-semibold px-8"
            >
              Start Skill Check
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ERROR VIEW
  // ----------------------------------------------------
  if (stageState === "ERROR") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <XCircle className="mx-auto mb-4 h-12 w-12 text-[#C8372D]" />
        <h2 className="font-heading text-xl font-bold text-[#202722]">Could Not Start Skill Check</h2>
        <p className="mt-2 text-sm text-[#69736D]">{errorMessage ?? "Unable to start this skill check right now."}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => setStageState("PREFLIGHT")}
            className="border-[#E5E1D7]"
          >
            Try Again
          </Button>
          <Button
            variant="default"
            onClick={() => navigate("/app/onboarding/skills")}
            className="bg-[#365FEA] text-white"
          >
            Back to Skills
          </Button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUBMITTED RESULTS VIEW
  // ----------------------------------------------------
  if (stageState === "SUBMITTED" && attemptResult) {
    const isPassed = attemptResult.passed;

    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-[#E5E1D7] bg-[#FFFEFA] p-8 shadow-sm text-center">
          {/* Status Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F0EEE7]">
            {isPassed ? (
              <CheckCircle2 className="h-10 w-10 text-[#2E6248]" />
            ) : (
              <XCircle className="h-10 w-10 text-[#69736D]" />
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isPassed
                ? "border border-[#438866]/30 bg-[#438866]/10 text-[#2E6248]"
                : "border border-[#C97A2E]/35 bg-[#C97A2E]/10 text-[#94581F]"
            }`}
          >
            {isPassed ? "Skill Check Passed" : "Skill Check Completed — Try Again Soon"}
          </span>

          <h1 className="font-heading mt-4 text-3xl font-extrabold text-[#202722]">
            {isPassed
              ? `Great work! You verified ${attemptResult.skillName}`
              : `${attemptResult.skillName} Check Result`}
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm text-[#69736D]">
            {isPassed
              ? `You scored ${attemptResult.score}%, passing the ${attemptResult.passingScore}% target for ${attemptResult.levelName}. Your verified badge is now active.`
              : `You scored ${attemptResult.score}%, below the ${attemptResult.passingScore}% passing score. Review the feedback below before trying again.`}
          </p>

          {/* Score Badge Details */}
          <div className="my-8 grid grid-cols-3 gap-4 rounded-xl border border-[#E5E1D7] bg-[#F0EEE7] p-4 text-left">
            <div>
              <div className="text-xs text-[#69736D]">Your Score</div>
              <div className="font-heading mt-1 text-2xl font-bold text-[#202722]">
                {attemptResult.score}%
              </div>
            </div>
            <div>
              <div className="text-xs text-[#69736D]">Passing Score</div>
              <div className="font-heading mt-1 text-2xl font-bold text-[#69736D]">
                {attemptResult.passingScore}%
              </div>
            </div>
            <div>
              <div className="text-xs text-[#69736D]">Verified Level</div>
              <div className="font-heading mt-1 text-lg font-bold text-[#2E6248]">
                {attemptResult.verifiedLevelName ?? `Level ${attemptResult.verifiedLevel}`}
              </div>
            </div>
          </div>

          {/* Evaluations Breakdown */}
          {attemptResult.evaluations && attemptResult.evaluations.length > 0 && (
            <div className="mt-6 text-left">
              <h3 className="font-heading text-sm font-bold text-[#202722] mb-3">
                Question Feedback
              </h3>
              <div className="space-y-3">
                {attemptResult.evaluations.map((evalItem, idx) => (
                  <div
                    key={evalItem.questionId}
                    className="rounded-lg border border-[#E5E1D7] bg-[#FFFEFA] p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#202722]">Question {idx + 1}</span>
                      <span
                        className={`font-semibold ${
                          evalItem.passed ? "text-[#2E6248]" : "text-[#94581F]"
                        }`}
                      >
                        {evalItem.earnedWeight} / {evalItem.maxWeight} pts
                      </span>
                    </div>
                    <p className="mt-1 text-[#69736D]">{evalItem.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-[#E5E1D7] pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/app/onboarding/skills")}
              className="border-[#E5E1D7]"
            >
              Back to Skills
            </Button>

            {isPassed && attemptResult.level < 3 && (
              <Button
                variant="default"
                size="sm"
                onClick={() =>
                  navigate(
                    `/app/assessment/${encodeURIComponent(attemptResult.skillSlug)}/${
                      attemptResult.level + 1
                    }`,
                  )
                }
                className="bg-[#438866] text-white hover:bg-[#356F52] font-semibold"
              >
                Proceed to Level {attemptResult.level + 1}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/app/marketplace")}
              className="bg-[#365FEA] text-white hover:bg-[#2949C6] font-semibold"
            >
              Browse Available Tasks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // IN_PROGRESS: ACTIVE SKILL CHECK WORKBENCH
  // ----------------------------------------------------
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Stream Interruption Full Modal Overlay */}
      {isInterrupted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="max-w-md w-full rounded-2xl border border-[#C8372D]/35 bg-[#FFFEFA] p-6 text-center shadow-2xl">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-[#C8372D]" />
            <h3 className="font-heading text-lg font-bold text-[#202722]">
              Camera or Screen Feed Paused
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#69736D]">
              Your camera or screen sharing paused. The timer is paused while you reconnect.
            </p>

            <div className="my-4 rounded-xl bg-[#C8372D]/[0.08] p-3 text-xs font-semibold text-[#9F1D22]">
              Time left to reconnect:{" "}
              <span className="text-base font-bold text-[#C8372D] tabular-nums">{interruptionGraceSeconds}s</span>
            </div>

            <p className="text-xs text-[#69736D]">
              Restore camera and screen access to continue your skill check.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              {!cameraActive && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={requestCamera}
                  className="bg-[#365FEA] text-white text-xs font-semibold"
                >
                  <Camera className="mr-1.5 h-3.5 w-3.5" />
                  Reconnect Camera
                </Button>
              )}
              {!screenActive && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={requestScreenShare}
                  className="bg-[#438866] text-white text-xs font-semibold"
                >
                  <ScreenShare className="mr-1.5 h-3.5 w-3.5" />
                  Share Screen Again
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={enableSimulatedProctoring}
                className="text-xs text-[#69736D] hover:text-[#202722]"
              >
                Continue without camera/screen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Switch Alert Banner */}
      {!isTabFocused && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-[#C97A2E]/40 bg-[#C97A2E]/[0.1] p-3 text-xs text-[#94581F]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#C97A2E]" />
            <span>
              <strong>Notice:</strong> You left the check window ({tabSwitchWarnings} notice
              {tabSwitchWarnings === 1 ? "" : "s"}). Please stay on this page until finished.
            </span>
          </div>
          <span className="font-semibold text-[#94581F]">Recorded</span>
        </div>
      )}

      {/* Sticky Assessment Header Bar */}
      <div className="sticky top-0 z-30 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E5E1D7] bg-[#FFFEFA]/95 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-[#F0EEE7] px-2.5 py-1 text-xs font-semibold text-[#202722]">
            {skillInfo.skillName}
          </span>
          <span className="text-xs text-[#69736D]">{skillInfo.levelName}</span>
          <span className="text-[#E5E1D7]">|</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E6248]">
            <span className="h-2 w-2 rounded-full bg-[#438866]" />
            Active Check
          </span>
          {tabSwitchWarnings > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-[#C97A2E]/15 px-2 py-0.5 text-xs font-medium text-[#94581F] tabular-nums">
              <AlertTriangle className="h-3 w-3" /> {tabSwitchWarnings} Notice{tabSwitchWarnings === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Timer Display */}
          <div className="flex items-center gap-1.5 rounded-lg bg-[#F0EEE7] px-3 py-1.5 text-sm font-semibold text-[#202722] tabular-nums">
            <Clock className="h-4 w-4 text-[#365FEA]" />
            <span>{formatTimer(timeRemainingSeconds)}</span>
          </div>

          {/* Mini PIP Camera Feed */}
          <div className="relative h-9 w-14 overflow-hidden rounded border border-[#E5E1D7] bg-black/10">
            <video
              ref={pipVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-0 right-0 bg-[#202722]/85 px-1 text-[10px] font-semibold text-white">
              REC
            </span>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="bg-[#438866] text-white hover:bg-[#356F52] text-xs font-semibold"
          >
            {isSubmitting ? "Submitting..." : "Submit Check"}
          </Button>
        </div>
      </div>

      {/* Question Progress Navigation Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E1D7] bg-[#FFFEFA] p-3 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentQuestionIndex;
            const hasAnswer = Boolean(answers[q.id]?.trim());
            const isFlagged = flaggedQuestions.has(idx);

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`relative flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? "bg-[#202722] text-[#FFFEFA] shadow"
                    : hasAnswer
                    ? "border border-[#438866]/50 bg-[#438866]/10 text-[#2E6248]"
                    : "border border-[#E5E1D7] bg-[#F0EEE7] text-[#69736D] hover:bg-[#E5E1D7]/70"
                }`}
              >
                {idx + 1}
                {isFlagged && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#C97A2E]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#69736D]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#438866]" /> Answered:{" "}
            {Object.keys(answers).filter((k) => answers[k]?.trim()).length} / {questions.length}
          </span>
          <button
            type="button"
            onClick={() => toggleFlagQuestion(currentQuestionIndex)}
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              flaggedQuestions.has(currentQuestionIndex)
                ? "text-[#94581F] font-semibold"
                : "text-[#69736D] hover:text-[#202722]"
            }`}
          >
            <Flag className="h-3.5 w-3.5" />
            {flaggedQuestions.has(currentQuestionIndex) ? "Flagged for Review" : "Flag Question"}
          </button>
        </div>
      </div>

      {/* Main Question Display & Answer Box */}
      {currentQuestion ? (
        <div className="rounded-2xl border border-[#E5E1D7] bg-[#FFFEFA] p-6 shadow-sm sm:p-8">
          {/* Question Title & Points Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#E5E1D7] pb-4">
            <div>
              <span className="text-xs font-semibold text-[#365FEA]">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <h2 className="font-heading mt-1 text-lg font-bold text-[#202722]">
                {currentQuestion.type === "CODE_TASK" ? "Practical Task" : "Multiple Choice Question"}
              </h2>
            </div>

            <div className="rounded-md bg-[#F0EEE7] px-2.5 py-1 text-xs font-medium text-[#69736D] tabular-nums">
              Weight: <strong>{currentQuestion.weight} pts</strong>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="mt-5 text-sm leading-relaxed text-[#202722]">
            <p className="whitespace-pre-wrap">{currentQuestion.prompt}</p>
          </div>

          {/* Interactive Input Form */}
          <div className="mt-6">
            {currentQuestion.type === "MULTIPLE_CHOICE" && currentQuestion.options ? (
              <div className="space-y-3">
                {currentQuestion.options.map((opt) => {
                  const isChecked = answers[currentQuestion.id] === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                        isChecked
                          ? "border-[#365FEA] bg-[#365FEA]/5 ring-1 ring-[#365FEA]"
                          : "border-[#E5E1D7] bg-[#FFFEFA] hover:bg-[#F0EEE7]"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={opt.id}
                        checked={isChecked}
                        onChange={() => handleUpdateAnswer(currentQuestion.id, opt.id)}
                        className="mt-0.5 h-4 w-4 border-[#E5E1D7] text-[#365FEA] focus:ring-[#365FEA]"
                      />
                      <span className="text-xs font-medium text-[#202722]">{opt.text}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              /* CODE_TASK Editor */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#69736D]">
                  <span className="text-xs">Your solution:</span>
                  {currentQuestion.starterCode && (
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateAnswer(currentQuestion.id, currentQuestion.starterCode ?? "")
                      }
                      className="inline-flex items-center gap-1 text-[11px] text-[#365FEA] hover:underline"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset to Starter Text
                    </button>
                  )}
                </div>

                <div className="overflow-hidden rounded-xl border border-[#E5E1D7] bg-[#F0EEE7]">
                  <textarea
                    value={answers[currentQuestion.id] ?? ""}
                    onChange={(e) => handleUpdateAnswer(currentQuestion.id, e.target.value)}
                    rows={12}
                    className="w-full bg-[#FFFEFA] p-4 font-mono text-xs text-[#202722] focus:outline-none focus:ring-1 focus:ring-[#365FEA]"
                    placeholder="// Write your solution here..."
                    spellCheck={false}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-[#E5E1D7] pt-5">
            <Button
              variant="outline"
              size="sm"
              disabled={!canProceedToPrev}
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              className="border-[#E5E1D7] text-xs"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Previous Question
            </Button>

            {canProceedToNext ? (
              <Button
                variant="default"
                size="sm"
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
                }
                className="bg-[#202722] text-[#FFFEFA] hover:bg-[#202722]/90 text-xs font-semibold"
              >
                Next Question
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="bg-[#438866] text-white hover:bg-[#356F52] text-xs font-semibold"
              >
                {isSubmitting ? "Submitting..." : "Submit Check"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <LoadingBlock label="Loading questions..." />
      )}
    </div>
  );
}
