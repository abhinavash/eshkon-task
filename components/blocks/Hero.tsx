"use client";
import Image from "next/image";
import styles from "./Hero.module.css";

export interface HeroProps {
  heading: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  backgroundUrl?: string;
}

export default function Hero({ heading, subtitle, ctaLabel, ctaHref, backgroundUrl }: HeroProps) {
  return (
    <section className={styles.hero}>
      {backgroundUrl && (
        <Image src={backgroundUrl} alt="" fill priority className={styles.bg} />
      )}
      <div className={styles.content}>
        <h1>{heading}</h1>
        {subtitle && <p>{subtitle}</p>}
        {ctaLabel && ctaHref && (
          <a className={styles.cta} href={ctaHref}>{ctaLabel}</a>
        )}
      </div>
    </section>
  );
}
