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
          "rounded-md border border-brand-seafoam/70 dark:border-brand-seafoam/40 px-3 py-1.5 text-sm font-medium text-brand-ink dark:text-brand-seafoam hover:bg-brand-seafoam/20 dark:hover:bg-brand-seafoam/15"
        }
      >
        {label}
      </button>
    </form>
  );
}
