export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="fixed inset-0 flex items-center justify-center max-w-2xl mx-auto">
      {children}
    </main>
  );
}
