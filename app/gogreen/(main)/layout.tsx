import GoGreenNav from "../GoGreenNav";

export default function GoGreenMainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoGreenNav />
      <main className="mx-auto max-w-3xl px-4 py-6 print:max-w-full print:p-0">{children}</main>
    </>
  );
}
