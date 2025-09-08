"use client";

import Link from "next/link";
import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Left: Brand / Logo */}
        <div className={styles.brand}>
          <h2>Cornholio 🚀</h2>
          <p>- Undiagnosed schizo programmer</p>
        </div>

        {/* Center: Links */}
        <div className={styles.links}>
          <h4>Quick Links</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/cars">Cars</Link></li>
          </ul>
        </div>

        {/* Right: Socials */}
        <div className={styles.socials}>
          <h4>Socials</h4>
          <div className={styles.icons}>
            <a href="https://github.com/cornholio6969" aria-label="GitHub">💻</a>
            <a href="https://gitlab.cornholio.dev/cornholio" aria-label="Gitlab">💻</a>
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Cornholio. All rights reserved.</p>
      </div>
    </footer>
  );
}
