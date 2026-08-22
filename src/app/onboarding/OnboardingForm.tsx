"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChipSelector } from "@/components/ChipSelector";
import { COMMUNITIES, HELP_CATEGORIES, INTERESTS, YEARS_OF_STUDY } from "@/data/options";
import { createClient } from "@/lib/supabase/client";
import { HelpCategory, Interest, MatchTag, OnboardingData } from "@/lib/types";

const TOTAL_STEPS = 4;

const EMPTY_FORM: OnboardingData = {
  name: "",
  university: "",
  program: "",
  year: "",
  interests: [],
  helpWith: [],
  lookingFor: [],
};

export function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OnboardingData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const canContinue = (() => {
    if (step === 1) return form.name.trim() && form.university.trim() && form.program.trim() && form.year;
    if (step === 2) return form.interests.length > 0;
    if (step === 3) return form.helpWith.length > 0;
    return true;
  })();

  function toggle(list: MatchTag[], value: MatchTag): MatchTag[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  async function handleFinish() {
    setSaving(true);
    setSaveError(false);

    const communities = form.lookingFor.filter((tag) => (COMMUNITIES as string[]).includes(tag));
    const supabase = createClient();
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      name: form.name,
      university: form.university,
      program: form.program,
      year: form.year,
      interests: form.interests,
      help_with: form.helpWith,
      looking_for: form.lookingFor,
      communities,
    });

    setSaving(false);

    if (error) {
      setSaveError(true);
      return;
    }

    router.push("/account");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm font-medium text-stone-500">
          <span>Step {step} of {TOTAL_STEPS}</span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full rounded-full bg-violet-600 transition-all"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        {step === 1 && (
          <div className="animate-fade-in-up">
            <h1 className="text-2xl font-semibold text-stone-900">Let&apos;s get to know you</h1>
            <p className="mt-1.5 text-stone-600">A little about you and where you study.</p>

            <div className="mt-6 space-y-4">
              <Field label="Name">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Aisha Rahman"
                  className="input"
                />
              </Field>
              <Field label="University">
                <input
                  value={form.university}
                  onChange={(e) => setForm({ ...form, university: e.target.value })}
                  placeholder="University of Waterloo"
                  className="input"
                />
              </Field>
              <Field label="Program">
                <input
                  value={form.program}
                  onChange={(e) => setForm({ ...form, program: e.target.value })}
                  placeholder="Computer Science"
                  className="input"
                />
              </Field>
              <Field label="Year of study">
                <div className="flex flex-wrap gap-2">
                  {YEARS_OF_STUDY.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setForm({ ...form, year })}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                        form.year === year
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-stone-300 bg-white text-stone-700 hover:border-violet-300"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up">
            <h1 className="text-2xl font-semibold text-stone-900">What are you into?</h1>
            <p className="mt-1.5 text-stone-600">Pick the tech interests that describe you best.</p>

            <div className="mt-6 space-y-6">
              <ChipSelector
                options={INTERESTS}
                selected={form.interests}
                onToggle={(option) =>
                  setForm({ ...form, interests: toggle(form.interests, option as Interest) as Interest[] })
                }
              />

              <div>
                <p className="mb-2 text-sm font-medium text-stone-700">Community (optional)</p>
                <ChipSelector
                  options={COMMUNITIES}
                  selected={form.lookingFor.filter((tag) => (COMMUNITIES as string[]).includes(tag))}
                  onToggle={(option) =>
                    setForm({ ...form, lookingFor: toggle(form.lookingFor, option as MatchTag) })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up">
            <h1 className="text-2xl font-semibold text-stone-900">What can you help with?</h1>
            <p className="mt-1.5 text-stone-600">
              Choose anything you&apos;d be glad to offer other women &mdash; even a little.
            </p>

            <div className="mt-6">
              <ChipSelector
                options={HELP_CATEGORIES}
                selected={form.helpWith}
                onToggle={(option) =>
                  setForm({ ...form, helpWith: toggle(form.helpWith, option as HelpCategory) as HelpCategory[] })
                }
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in-up text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-2xl">
              ✨
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-stone-900">You&apos;re all set, {form.name.split(" ")[0] || "there"}!</h1>
            <p className="mt-1.5 text-stone-600">
              We&apos;ll use what you shared to help you find the right women at{" "}
              {form.university || "your university"}.
            </p>
            <button
              type="button"
              onClick={handleFinish}
              disabled={saving}
              className="mt-8 rounded-full bg-violet-700 px-8 py-3.5 text-base font-semibold text-white shadow-md shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save & view my profile"}
            </button>
            {saveError && (
              <p className="mt-3 text-sm text-rose-600">
                Something went wrong saving your profile. Please try again.
              </p>
            )}
          </div>
        )}

        {step < 4 && (
          <div className="mt-8 flex items-center justify-between border-t border-stone-100 pt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-stone-500 transition hover:text-stone-800 disabled:opacity-0"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
              disabled={!canContinue}
              className="rounded-full bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-stone-700">{label}</span>
      {children}
    </label>
  );
}
