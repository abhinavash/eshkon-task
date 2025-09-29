"use client";
import Image from "next/image";
import styles from "./TwoColumnRow.module.css";

export interface TwoColumnRowProps {
  leftHeading: string;
  leftSubtitle?: string;
  leftCtaLabel?: string;
  leftCtaHref?: string;
  rightImageUrl?: string;
}

export default function TwoColumnRow({ leftHeading, leftSubtitle, leftCtaLabel, leftCtaHref, rightImageUrl }: TwoColumnRowProps) {
  return (
    <section className={styles.row}>
      <div className={styles.left}>
        <h2>{leftHeading}</h2>
        {leftSubtitle && <p>{leftSubtitle}</p>}
        {leftCtaLabel && leftCtaHref && <a className={styles.cta} href={leftCtaHref}>{leftCtaLabel}</a>}
      </div>
      <div className={styles.right}>
        {rightImageUrl && (
          <Image src={rightImageUrl} alt="" width={640} height={480} className={styles.image} />
        )}
      </div>
    </section>
  );
}
