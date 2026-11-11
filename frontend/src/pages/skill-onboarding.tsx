import { useState, useMemo, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  CheckCircle2,
  Lock,
  Search,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Check,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingBlock } from "@/components/ui/states";
import type { SkillCatalogItem, SkillCategoryDefinition, SkillTaxonomyItem } from "@/lib/types";

export default function SkillOnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [hasInitializedTargets, setHasInitializedTargets] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Fetch taxonomy (12 categories, 50+ granular skills)
  const { data: taxonomyData, isLoading: isLoadingTaxonomy } = useQuery({
    queryKey: ["skills", "taxonomy"],
    queryFn: () => api.skills.taxonomy(),
  });

  // Fetch user's saved focus skills
  const { data: selectedData, isLoading: isLoadingSelected } = useQuery({
    queryKey: ["skills", "selected"],
    queryFn: () => api.skills.getSelected(),
    enabled: Boolean(user),
  });

  // Fetch verified skills and stages from existing assessment engine
  const { data: catalogData, isLoading: isLoadingCatalog } = useQuery({
    queryKey: ["skills", "list"],
    queryFn: () => api.skills.list(),
  });

  // Initialize selected skills from user profile if not yet set
  useEffect(() => {
    if (!hasInitializedTargets && selectedData?.selectedSkills) {
      if (selectedData.selectedSkills.length > 0) {
        setSelectedTargets(selectedData.selectedSkills);
      } else {
        // Default recommended starter selections if empty
        setSelectedTargets(["typescript", "python"]);
      }
      setHasInitializedTargets(true);
    }
  }, [selectedData, hasInitializedTargets]);

  const categories: SkillCategoryDefinition[] = useMemo(() => {
    return taxonomyData?.categories ?? [];
  }, [taxonomyData]);

  const taxonomyItems: SkillTaxonomyItem[] = useMemo(() => {
    return taxonomyData?.taxonomy ?? [];
  }, [taxonomyData]);

  const backendSkills: SkillCatalogItem[] = useMemo(() => {
    return catalogData?.skills ?? [];
  }, [catalogData]);

  // Combine taxonomy with live assessment verification status
  const enrichedSkills = useMemo(() => {
    return taxonomyItems.map((item) => {
      const match = backendSkills.find(
        (bs) => bs.slug === item.slug || bs.name.toLowerCase() === item.name.toLowerCase(),
      );
      return {
        ...item,
        backendId: match?.id,
        verifiedLevel: match?.verifiedLevel ?? 0,
        verifiedLevelName: match?.verifiedLevelName ?? null,
        stages: match?.stages ?? [],
        hasAssessmentEngine: item.isAssessed || Boolean(match),
      };
    });
  }, [taxonomyItems, backendSkills]);

  // Filter skills by category & search query
  const filteredSkills = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enrichedSkills.filter((item) => {
      const matchesCategory = selectedCategory === "ALL" || item.categoryId === selectedCategory;
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [enrichedSkills, selectedCategory, searchQuery]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (slugs: string[]) => api.skills.saveSelected(slugs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills", "selected"] });
      setSaveSuccessMessage("Selected skills saved to profile.");
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    },
  });

  // Requesters should never be forced through reviewer skill onboarding
  if (user && user.role !== "REVIEWER") {
    return <Navigate to="/app" replace />;
  }

  function toggleSkill(slug: string) {
    setSelectedTargets((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      return next;
    });
  }

  function removeSkill(slug: string) {
    setSelectedTargets((prev) => prev.filter((s) => s !== slug));
  }

  async function handleSaveAndProceed() {
    await saveMutation.mutateAsync(selectedTargets);
    // Find the first selected skill that has an active assessment engine to start assessment
    const firstAssessed = enrichedSkills.find(
      (s) => selectedTargets.includes(s.slug) && s.hasAssessmentEngine,
    );
    if (firstAssessed) {
      const nextLevel = Math.min(firstAssessed.verifiedLevel + 1, 3);
      navigate(`/app/assessment/${encodeURIComponent(firstAssessed.slug)}/${nextLevel}`);
    } else {
      navigate("/app/workspace");
    }
  }

  const isLoading = isLoadingTaxonomy || isLoadingCatalog || isLoadingSelected;
  const verifiedCount = backendSkills.filter((s) => s.verifiedLevel > 0).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="relative mb-6 rounded-2xl border border-[#E4E9F2] bg-[#FFFFFF] p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#12A875]/30 bg-[#12A875]/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#0B7D56]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Reviewer Onboarding
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-[#141B2D] sm:text-3xl">
              What can you help with?
            </h1>
            <p className="text-sm leading-relaxed text-[#68738A]">
              Select the skills you can confidently work with. Your selected skills will be assessed to
              establish your verified proficiency levels.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 rounded-xl border border-[#E4E9F2] bg-[#F5F7FC] p-3 text-xs text-[#68738A] sm:items-end sm:text-right">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#141B2D]">
              <Award className="h-4 w-4 text-[#4263EB]" />
              <span>{verifiedCount} Verified Credential{verifiedCount === 1 ? "" : "s"}</span>
            </div>
            <p className="max-w-xs text-[11px]">
              TrustToPay strictly eliminates self-reported ratings. Levels are unlocked via proctored assessments.
            </p>
          </div>
        </div>

        {/* Informational Callout Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#E4E9F2] pt-3 text-xs text-[#68738A]">
          <span className="font-semibold text-[#141B2D]">Zero Self-Reporting:</span>
          <span>Qualification badges reflect objective assessment results only.</span>
          <span className="text-[#E4E9F2]">â€¢</span>
          <span className="text-[#4263EB] font-medium">1 Question Per Level</span>
          <span className="text-[#E4E9F2]">â€¢</span>
          <span className="text-[#0B7D56] font-medium">Camera & Screen Proctoring</span>
        </div>
      </div>

      {/* Selected Skills Bar / Drawer */}
      <div className="mb-6 rounded-xl border border-[#4263EB]/30 bg-[#FFFFFF] p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4263EB]">
                Selected Skills ({selectedTargets.length}):
              </span>
              {saveSuccessMessage && (
                <span className="text-xs font-semibold text-[#0B7D56] inline-flex items-center gap-1">
                  <Check className="h-3 w-3" /> {saveSuccessMessage}
                </span>
              )}
            </div>

            {selectedTargets.length === 0 ? (
              <p className="text-xs text-[#68738A] italic">
                No skills selected yet. Browse or search below and click on skills you can review.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedTargets.map((slug) => {
                  const item = enrichedSkills.find((s) => s.slug === slug);
                  const isAssessed = item?.hasAssessmentEngine ?? false;
                  return (
                    <span
                      key={slug}
                      className="inline-flex items-center gap-1 rounded-md border border-[#4263EB]/30 bg-[#4263EB]/5 px-2 py-1 text-xs font-medium text-[#141B2D]"
                    >
                      <span>{item?.name ?? slug}</span>
                      {isAssessed && (
                        <span className="text-[10px] text-[#0B7D56] font-semibold">â— Assessed</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeSkill(slug)}
                        className="ml-0.5 rounded text-[#68738A] hover:bg-[#E4E9F2] hover:text-[#141B2D]"
                        title="Remove skill"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedTargets.length === 0 || saveMutation.isPending}
              onClick={() => saveMutation.mutate(selectedTargets)}
              className="border-[#E4E9F2] bg-white text-xs hover:bg-[#EDF0F6]"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Saving...
                </>
              ) : (
                "Save Selection"
              )}
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={selectedTargets.length === 0 || saveMutation.isPending}
              onClick={handleSaveAndProceed}
              className="bg-[#4263EB] text-xs font-semibold text-white hover:bg-[#4263EB]/90 gap-1.5"
            >
              <span>Begin Assessment</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Navigation */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68738A]" />
            <Input
              type="search"
              placeholder="Search skills by name, framework, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-[#E4E9F2] bg-[#FFFFFF] pl-9 text-sm focus:border-[#4263EB]"
            />
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="text-xs text-[#68738A]"
            >
              Clear Search
            </Button>
          )}
        </div>

        {/* 12 Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              selectedCategory === "ALL"
                ? "bg-[#141B2D] text-[#FFFFFF] shadow-sm"
                : "border border-[#E4E9F2] bg-[#FFFFFF] text-[#68738A] hover:border-[#141B2D]/30 hover:text-[#141B2D]"
            }`}
          >
            All Domains ({enrichedSkills.length})
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = enrichedSkills.filter((s) => s.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-[#141B2D] text-[#FFFFFF] shadow-sm"
                    : "border border-[#E4E9F2] bg-[#FFFFFF] text-[#68738A] hover:border-[#141B2D]/30 hover:text-[#141B2D]"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills Grid */}
      {isLoading ? (
        <LoadingBlock label="Loading skills catalogue..." />
      ) : filteredSkills.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E4E9F2] bg-[#FFFFFF] p-10 text-center">
          <HelpCircle className="mx-auto mb-2 h-7 w-7 text-[#68738A]" />
          <h3 className="font-heading text-sm font-semibold text-[#141B2D]">No skills match your search</h3>
          <p className="mt-1 text-xs text-[#68738A]">Try searching another keyword or choose "All Domains".</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 border-[#E4E9F2] text-xs"
            onClick={() => {
              setSelectedCategory("ALL");
              setSearchQuery("");
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((skill) => {
            const isSelected = selectedTargets.includes(skill.slug);
            const isVerified = skill.verifiedLevel > 0;
            const nextLevel = Math.min(skill.verifiedLevel + 1, 3);

            return (
              <div
                key={skill.slug}
                onClick={() => toggleSkill(skill.slug)}
                className={`group relative flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#4263EB] bg-[#FFFFFF] ring-2 ring-[#4263EB]/20 shadow-md"
                    : "border-[#E4E9F2] bg-[#FFFFFF] hover:border-[#141B2D]/30 hover:bg-[#EDF0F6]/40"
                }`}
              >
                <div>
                  {/* Category Pill and Selection Checkbox */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-md border border-[#E4E9F2] bg-[#F5F7FC] px-2 py-0.5 text-[11px] font-semibold text-[#68738A]">
                      {skill.categoryName}
                    </span>

                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs transition-colors ${
                        isSelected
                          ? "border-[#4263EB] bg-[#4263EB] text-white"
                          : "border-[#E4E9F2] bg-white group-hover:border-[#141B2D]/40"
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </div>

                  {/* Skill Title & Engine Badge */}
                  <div className="mt-2.5 flex items-baseline justify-between gap-2">
                    <h3 className="font-heading text-base font-bold text-[#141B2D]">
                      {skill.name}
                    </h3>
                    {skill.hasAssessmentEngine && (
                      <span className="inline-flex items-center gap-1 rounded bg-[#12A875]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#0B7D56]">
                        <ShieldCheck className="h-3 w-3" /> Ready
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-1 text-xs leading-relaxed text-[#68738A] line-clamp-2">
                    {skill.description}
                  </p>
                </div>

                {/* Footer Status & Actions */}
                <div className="mt-3.5 pt-2.5 border-t border-[#E4E9F2] flex items-center justify-between text-xs">
                  {skill.hasAssessmentEngine ? (
                    isVerified ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#0B7D56]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {skill.verifiedLevelName ?? `Level ${skill.verifiedLevel}`}
                      </span>
                    ) : (
                      <span className="text-xs text-[#4263EB] font-medium flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Proctored Test Ready
                      </span>
                    )
                  ) : (
                    <span className="text-[11px] text-[#68738A] flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Test in development
                    </span>
                  )}

                  {skill.hasAssessmentEngine && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/app/assessment/${encodeURIComponent(skill.slug)}/${nextLevel}`);
                      }}
                      className="h-7 px-2 text-xs text-[#4263EB] hover:bg-[#4263EB]/10"
                    >
                      Take Level {nextLevel} â†’
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
