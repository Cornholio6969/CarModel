"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./navbar.module.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Brand */}
        <Link href="/" className={styles.brand}>
          Cornholio
        </Link>

        {/* Mobile toggle */}
        <button
          className={styles.toggle}
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>

        {/* Links */}
        <div className={`${styles.links} ${isOpen ? styles.show : ""}`}>
          <Link href="/" className={styles.link}>
            Home
          </Link>
          <Link href="/cars" className={styles.link}>
            Cars
          </Link>
        </div>
      </div>
    </nav>
  );
}