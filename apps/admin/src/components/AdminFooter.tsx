import { VersionBadge } from "@store-demo/ui";

const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";

export function AdminFooter() {
  return (
    <footer className="border-t border-gray-200">
      <div className="mx-auto flex max-w-6xl justify-center px-4 py-6">
        <VersionBadge
          version={version}
          href={`https://github.com/afranco83/store-demo/releases/tag/v${version}`}
        />
      </div>
    </footer>
  );
}
