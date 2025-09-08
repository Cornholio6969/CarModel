import "./globals.css";
import Navbar from "@/app/components/navbar/navbar";
import Footer from "@/app/components/footer/footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}