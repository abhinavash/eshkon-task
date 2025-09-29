import Image from "next/image";
import styles from "./page.module.css";
import CursorTrail from "../components/CursorTrail";
import SpotlightBG from "../components/SpotlightBG";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <SpotlightBG />
      <div className={styles.content}>
        <h1 className={styles.title}>Contentful Landing Page Builder</h1>
        <p className={styles.subtitle}>Assemble landing pages visually, save layout as JSON to Contentful, and render with Next.js SSG.</p>
        <div className={styles.actions}>
          <a className="btn btnPrimary" href="/landing/page-1">Landing Page 1</a>
          <a className="btn" href="/landing/page-2">Landing Page 2</a>
          <a className="btn" href="/contentful-app">Open Contentful App</a>
        </div>
      </div>
      <CursorTrail />
    </div>
  );
}
