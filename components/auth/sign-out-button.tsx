import { signOutAction } from "@/lib/auth/sign-out";

type SignOutButtonProps = {
  className?: string;
  label?: string;
};

export function SignOutButton({ className, label = "Log out" }: SignOutButtonProps) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className={
          className ??
          "rounded-md border border-brand-border bg-brand-surface px-3 py-1.5 text-sm font-medium text-brand-teal hover:bg-brand-sunshine-yellow/25"
        }
      >
        {label}
      </button>
    </form>
  );
}
