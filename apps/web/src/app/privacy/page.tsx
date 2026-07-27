import Link from "next/link";

export default function Privacy() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col justify-center px-6">
      <div className="mb-12 mt-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Privacy</h1>
      </div>

      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">We don&apos;t collect anything.</strong>
        </p>

        <p>
          No accounts. No cookies. No tracking. No analytics. No personal data is ever stored on our
          servers. Your animal avatar and color preference are saved in your browser&apos;s
          localStorage and never transmitted to us.
        </p>

        <p>
          Game scores are stored anonymously using a randomly generated identifier that resets if you
          clear your browser data. Nothing ties back to you as a person.
        </p>

        <p>
          We use Ko-fi for donations — that service has its own privacy policy which applies if you
          choose to donate.
        </p>

        <div className="pt-2 text-center">
          <Link href="/" className="inline-block text-xs underline underline-offset-2 hover:text-foreground">
            Back to games
          </Link>
        </div>
      </div>
    </main>
  );
}
