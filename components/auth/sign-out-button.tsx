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
          "rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        }
      >
        {label}
      </button>
    </form>
  );
}
