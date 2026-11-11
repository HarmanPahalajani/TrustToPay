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
            "Proctoring stream was not restored within the 45-second grace window. The assessment attempt was invalidated.",
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#68738A] hover:text-[#141B2D]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Skill Catalogue
          </Link>
          <span className="text-xs font-medium text-[#68738A]">
            Proctoring check
          </span>
        </div>

        <div className="rounded-2xl border border-[#E4E9F2] bg-[#FFFFFF] p-6 shadow-sm sm:p-8">
          <div className="border-b border-[#E4E9F2] pb-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#4263EB]/10 px-3 py-1 text-xs font-semibold text-[#4263EB]">
              <ShieldCheck className="h-4 w-4" />
              Proctored Skill Verification
            </span>
            <h1 className="font-heading mt-3 text-2xl font-bold tracking-tight text-[#141B2D] sm:text-3xl">
              Pre-Flight Proctoring Setup: {skillSlug.toUpperCase()} (Level {levelNum})
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#68738A]">
              TrustToPay certifications require compulsory webcam and screen sharing verification.
              Your evaluation will be analyzed in real time to guarantee integrity and unlock high-reward AI escalation assignments.
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
            <div className="flex flex-col justify-between rounded-xl border border-[#E4E9F2] bg-[#F5F7FC] p-5">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#141B2D]">
                    <Camera className="h-4 w-4 text-[#4263EB]" />
                    <span>1. Webcam Video Feed</span>
                  </div>
                  {cameraActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0B7D56]">
                      <CheckCircle2 className="h-4 w-4" /> Active
                    </span>
                  ) : (
                    <span className="text-xs text-[#68738A]">Required</span>
                  )}
                </div>

                <p className="mt-2 text-xs text-[#68738A]">
                  Position your camera so your face and environment are clearly visible throughout the entire assessment.
                </p>

                {/* Camera Viewport */}
                <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg border border-[#E4E9F2] bg-black/5 flex items-center justify-center">
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`h-full w-full object-cover ${cameraActive ? "block" : "hidden"}`}
                  />
                  {!cameraActive && (
                    <div className="flex flex-col items-center gap-2 text-center p-4">
                      <Video className="h-8 w-8 text-[#68738A]/60" />
                      <span className="text-xs text-[#68738A]">Webcam feed not connected</span>
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
                      ? "border-[#12A875] text-[#0B7D56] bg-white hover:bg-[#12A875]/10"
                      : "bg-[#4263EB] text-white hover:bg-[#4263EB]/90"
                  }`}
                  onClick={requestCamera}
                >
                  {cameraActive ? "Re-calibrate Camera" : "Enable Camera Feed"}
                </Button>
              </div>
            </div>

            {/* 2. Screen Share Verification Card */}
            <div className="flex flex-col justify-between rounded-xl border border-[#E4E9F2] bg-[#F5F7FC] p-5">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#141B2D]">
                    <ScreenShare className="h-4 w-4 text-[#0B7D56]" />
                    <span>2. Full Screen Sharing</span>
                  </div>
                  {screenActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0B7D56]">
                      <CheckCircle2 className="h-4 w-4" /> Sharing
                    </span>
                  ) : (
                    <span className="text-xs text-[#68738A]">Required</span>
                  )}
                </div>

                <p className="mt-2 text-xs text-[#68738A]">
                  Share your entire screen. Navigating away, opening third-party AI interfaces, or switching tabs will be flagged.
                </p>

                {/* Screen Preview Viewport */}
                <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg border border-[#E4E9F2] bg-black/5 flex items-center justify-center">
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`h-full w-full object-cover ${screenActive ? "block" : "hidden"}`}
                  />
                  {!screenActive && (
                    <div className="flex flex-col items-center gap-2 text-center p-4">
                      <ScreenShare className="h-8 w-8 text-[#68738A]/60" />
                      <span className="text-xs text-[#68738A]">Screen stream not detected</span>
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
                      ? "border-[#12A875] text-[#0B7D56] bg-white hover:bg-[#12A875]/10"
                      : "bg-[#12A875] text-white hover:bg-[#12A875]/90"
                  }`}
                  onClick={requestScreenShare}
                >
                  {screenActive ? "Re-share Screen" : "Share Entire Screen"}
                </Button>
              </div>
            </div>
          </div>

          {/* Dev/Testing Mode fallback */}
          {!allChecksPassed && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-dashed border-[#E4E9F2] p-3 text-xs text-[#68738A]">
              <span>Testing without physical hardware?</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={enableSimulatedProctoring}
                className="text-xs text-[#4263EB] hover:underline"
              >
                Enable Proctored Simulator Mode
              </Button>
            </div>
          )}

          {/* Policy Agreement Checkbox */}
          <div className="mt-6 rounded-xl border border-[#E4E9F2] bg-[#FFFFFF] p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={proctoringAgreement}
                onChange={(e) => setProctoringAgreement(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#E4E9F2] text-[#4263EB] focus:ring-[#4263EB]"
              />
              <span className="text-xs leading-relaxed text-[#141B2D]">
                <strong>Proctored Evaluation Agreement:</strong> I confirm that I will complete this assessment
                independently without unauthorized external assistance. I acknowledge that webcam and screen sharing feeds
                are continuously monitored. Losing stream connectivity or excessive window unfocusing will automatically
                terminate and invalidate the attempt.
              </span>
            </label>
          </div>

          {/* Launch Assessment Action */}
          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-[#E4E9F2] pt-5 sm:flex-row">
            <div className="text-xs text-[#68738A]">
              Estimated duration: <strong>30 minutes</strong> | Passing threshold: <strong>80%</strong>
            </div>

            <Button
              variant="default"
              size="lg"
              disabled={!allChecksPassed || !proctoringAgreement}
              onClick={handleStartAssessment}
              className="w-full sm:w-auto bg-[#4263EB] text-white hover:bg-[#4263EB]/90 disabled:opacity-50 text-sm font-semibold px-8"
            >
              Enter Proctored Assessment
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
        <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h2 className="font-heading text-xl font-bold text-[#141B2D]">Assessment Session Error</h2>
        <p className="mt-2 text-sm text-[#68738A]">{errorMessage ?? "Unable to initialize this assessment."}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => setStageState("PREFLIGHT")}
            className="border-[#E4E9F2]"
          >
            Retry Pre-Flight
          </Button>
          <Button
            variant="default"
            onClick={() => navigate("/app/onboarding/skills")}
            className="bg-[#4263EB] text-white"
          >
            Return to Catalogue
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
        <div className="overflow-hidden rounded-2xl border border-[#E4E9F2] bg-[#FFFFFF] p-8 shadow-sm text-center">
          {/* Status Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F7FC]">
            {isPassed ? (
              <CheckCircle2 className="h-10 w-10 text-[#0B7D56]" />
            ) : (
              <XCircle className="h-10 w-10 text-[#68738A]" />
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isPassed
                ? "border border-[#12A875]/30 bg-[#12A875]/10 text-[#0B7D56]"
                : "border border-amber-300 bg-amber-50 text-amber-800"
            }`}
          >
            {isPassed ? "Assessment Certified" : "Assessment Completed — Needs Retake"}
          </span>

          <h1 className="font-heading mt-4 text-3xl font-extrabold text-[#141B2D]">
            {isPassed
              ? `Congratulations! You Certified in ${attemptResult.skillName}`
              : `${attemptResult.skillName} Assessment Result`}
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm text-[#68738A]">
            {isPassed
              ? `You achieved a score of ${attemptResult.score}%, exceeding the ${attemptResult.passingScore}% threshold for ${attemptResult.levelName}. Your credentials are live.`
              : `Your score of ${attemptResult.score}% did not meet the ${attemptResult.passingScore}% threshold. You may review the feedback below and retry after the cooldown period.`}
          </p>

          {/* Score Badge Details */}
          <div className="my-8 grid grid-cols-3 gap-4 rounded-xl border border-[#E4E9F2] bg-[#F5F7FC] p-4 text-left">
            <div>
              <div className="text-xs text-[#68738A]">Overall Score</div>
              <div className="font-heading mt-1 text-2xl font-bold text-[#141B2D]">
                {attemptResult.score}%
              </div>
            </div>
            <div>
              <div className="text-xs text-[#68738A]">Passing Threshold</div>
              <div className="font-heading mt-1 text-2xl font-bold text-[#68738A]">
                {attemptResult.passingScore}%
              </div>
            </div>
            <div>
              <div className="text-xs text-[#68738A]">Verified Credential</div>
              <div className="font-heading mt-1 text-lg font-bold text-[#0B7D56]">
                {attemptResult.verifiedLevelName ?? `Level ${attemptResult.verifiedLevel}`}
              </div>
            </div>
          </div>

          {/* Evaluations Breakdown */}
          {attemptResult.evaluations && attemptResult.evaluations.length > 0 && (
            <div className="mt-6 text-left">
              <h3 className="font-heading text-sm font-bold text-[#141B2D] mb-3">
                Question Grading Feedback
              </h3>
              <div className="space-y-3">
                {attemptResult.evaluations.map((evalItem, idx) => (
                  <div
                    key={evalItem.questionId}
                    className="rounded-lg border border-[#E4E9F2] bg-white p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#141B2D]">Question {idx + 1}</span>
                      <span
                        className={`font-semibold ${
                          evalItem.passed ? "text-[#0B7D56]" : "text-amber-700"
                        }`}
                      >
                        {evalItem.earnedWeight} / {evalItem.maxWeight} pts
                      </span>
                    </div>
                    <p className="mt-1 text-[#68738A]">{evalItem.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-[#E4E9F2] pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/app/onboarding/skills")}
              className="border-[#E4E9F2]"
            >
              Back to Skill Catalogue
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
                className="bg-[#12A875] text-white hover:bg-[#12A875]/90 font-semibold"
              >
                Proceed to Level {attemptResult.level + 1}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/app/marketplace")}
              className="bg-[#4263EB] text-white hover:bg-[#4263EB]/90 font-semibold"
            >
              Browse Qualified Tasks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // IN_PROGRESS: ACTIVE PROCTORED QUESTION WORKBENCH
  // ----------------------------------------------------
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Stream Interruption Full Modal Overlay */}
      {isInterrupted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="max-w-md w-full rounded-2xl border border-[#E5484D]/35 bg-[#FFFFFF] p-6 text-center shadow-2xl">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-[#E5484D]" />
            <h3 className="font-heading text-lg font-bold text-[#141B2D]">
              Proctoring Stream Interrupted
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#68738A]">
              Your webcam or screen sharing stream was lost or disconnected. Assessment input and the exam timer
              have been paused to preserve test integrity.
            </p>

            <div className="my-4 rounded-xl bg-[#E5484D]/[0.08] p-3 text-xs font-semibold text-[#9F1D22]">
              Grace Period Remaining:{" "}
              <span className="text-base font-bold text-[#C1282D] tabular-nums">{interruptionGraceSeconds}s</span>
            </div>

            <p className="text-xs text-[#68738A]">
              Restore camera and screen access before the grace period expires to resume your assessment.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              {!cameraActive && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={requestCamera}
                  className="bg-[#4263EB] text-white text-xs font-semibold"
                >
                  <Camera className="mr-1.5 h-3.5 w-3.5" />
                  Re-enable Camera
                </Button>
              )}
              {!screenActive && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={requestScreenShare}
                  className="bg-[#12A875] text-white text-xs font-semibold"
                >
                  <ScreenShare className="mr-1.5 h-3.5 w-3.5" />
                  Re-share Entire Screen
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={enableSimulatedProctoring}
                className="text-xs text-[#68738A] hover:text-[#141B2D]"
              >
                Resume in Proctor Simulator Mode
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Switch Alert Banner */}
      {!isTabFocused && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-[#F5A623]/40 bg-[#F5A623]/[0.1] p-3 text-xs text-[#9A6100]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#D9820B]" />
            <span>
              <strong>Warning:</strong> Assessment window lost focus ({tabSwitchWarnings} warning
              {tabSwitchWarnings === 1 ? "" : "s"}). Switching tabs is logged by the proctoring engine.
            </span>
          </div>
          <span className="font-semibold text-[#9A6100]">Flagged</span>
        </div>
      )}

      {/* Sticky Assessment Header Bar */}
      <div className="sticky top-0 z-30 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E4E9F2] bg-[#FFFFFF]/95 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-[#F5F7FC] px-2.5 py-1 text-xs font-semibold text-[#141B2D]">
            {skillInfo.skillName}
          </span>
          <span className="text-xs text-[#68738A]">{skillInfo.levelName}</span>
          <span className="text-[#E4E9F2]">|</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0B7D56]">
            <span className="h-2 w-2 rounded-full bg-[#12A875]" />
            Proctored Active
          </span>
          {tabSwitchWarnings > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-[#F5A623]/15 px-2 py-0.5 text-xs font-medium text-[#9A6100] tabular-nums">
              <AlertTriangle className="h-3 w-3" /> {tabSwitchWarnings} Warning{tabSwitchWarnings === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Timer Display */}
          <div className="flex items-center gap-1.5 rounded-lg bg-[#F5F7FC] px-3 py-1.5 text-sm font-semibold text-[#141B2D] tabular-nums">
            <Clock className="h-4 w-4 text-[#4263EB]" />
            <span>{formatTimer(timeRemainingSeconds)}</span>
          </div>

          {/* Mini PIP Camera Feed */}
          <div className="relative h-9 w-14 overflow-hidden rounded border border-[#E4E9F2] bg-black/10">
            <video
              ref={pipVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-0 right-0 bg-[#141B2D]/85 px-1 text-[10px] font-semibold text-white">
              REC
            </span>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="bg-[#12A875] text-white hover:bg-[#12A875]/90 text-xs font-semibold"
          >
            {isSubmitting ? "Submitting..." : "Submit Assessment"}
          </Button>
        </div>
      </div>

      {/* Question Progress Navigation Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E4E9F2] bg-[#FFFFFF] p-3 shadow-sm">
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
                    ? "bg-[#141B2D] text-[#FFFFFF] shadow"
                    : hasAnswer
                    ? "border border-[#12A875]/50 bg-[#12A875]/10 text-[#0B7D56]"
                    : "border border-[#E4E9F2] bg-[#F5F7FC] text-[#68738A] hover:bg-[#EDF0F6]"
                }`}
              >
                {idx + 1}
                {isFlagged && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#68738A]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#12A875]" /> Answered:{" "}
            {Object.keys(answers).filter((k) => answers[k]?.trim()).length} / {questions.length}
          </span>
          <button
            type="button"
            onClick={() => toggleFlagQuestion(currentQuestionIndex)}
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              flaggedQuestions.has(currentQuestionIndex)
                ? "text-amber-600 font-semibold"
                : "text-[#68738A] hover:text-[#141B2D]"
            }`}
          >
            <Flag className="h-3.5 w-3.5" />
            {flaggedQuestions.has(currentQuestionIndex) ? "Flagged for Review" : "Flag Question"}
          </button>
        </div>
      </div>

      {/* Main Question Display & Answer Box */}
      {currentQuestion ? (
        <div className="rounded-2xl border border-[#E4E9F2] bg-[#FFFFFF] p-6 shadow-sm sm:p-8">
          {/* Question Title & Points Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#E4E9F2] pb-4">
            <div>
              <span className="text-xs font-semibold text-[#4263EB]">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <h2 className="font-heading mt-1 text-lg font-bold text-[#141B2D]">
                {currentQuestion.type === "CODE_TASK" ? "Coding Task" : "Multiple Choice Question"}
              </h2>
            </div>

            <div className="rounded-md bg-[#F5F7FC] px-2.5 py-1 text-xs font-medium text-[#68738A] tabular-nums">
              Weight: <strong>{currentQuestion.weight} pts</strong>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="mt-5 text-sm leading-relaxed text-[#141B2D]">
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
                          ? "border-[#4263EB] bg-[#4263EB]/5 ring-1 ring-[#4263EB]"
                          : "border-[#E4E9F2] bg-[#FFFFFF] hover:bg-[#F5F7FC]"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={opt.id}
                        checked={isChecked}
                        onChange={() => handleUpdateAnswer(currentQuestion.id, opt.id)}
                        className="mt-0.5 h-4 w-4 border-[#E4E9F2] text-[#4263EB] focus:ring-[#4263EB]"
                      />
                      <span className="text-xs font-medium text-[#141B2D]">{opt.text}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              /* CODE_TASK Editor */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#68738A]">
                  <span className="font-mono text-[11px]">Type-safe solution:</span>
                  {currentQuestion.starterCode && (
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateAnswer(currentQuestion.id, currentQuestion.starterCode ?? "")
                      }
                      className="inline-flex items-center gap-1 text-[11px] text-[#4263EB] hover:underline"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset to Starter Code
                    </button>
                  )}
                </div>

                <div className="overflow-hidden rounded-xl border border-[#E4E9F2] bg-[#F5F7FC]">
                  <textarea
                    value={answers[currentQuestion.id] ?? ""}
                    onChange={(e) => handleUpdateAnswer(currentQuestion.id, e.target.value)}
                    rows={12}
                    className="w-full bg-[#10172A] p-4 font-mono text-xs text-[#F5F7FC] focus:outline-none focus:ring-1 focus:ring-[#4263EB]"
                    placeholder="// Write your solution here..."
                    spellCheck={false}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-[#E4E9F2] pt-5">
            <Button
              variant="outline"
              size="sm"
              disabled={!canProceedToPrev}
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              className="border-[#E4E9F2] text-xs"
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
                className="bg-[#141B2D] text-[#FFFFFF] hover:bg-[#141B2D]/90 text-xs font-semibold"
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
                className="bg-[#12A875] text-white hover:bg-[#12A875]/90 text-xs font-semibold"
              >
                {isSubmitting ? "Submitting..." : "Submit Assessment"}
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
