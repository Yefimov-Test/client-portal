import { ChatWidget } from "@/components/chat-widget";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {children}
      <ChatWidget />
    </div>
  );
}
