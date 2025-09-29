"use client";
import Image from "next/image";
import styles from "./ImageGrid2x2.module.css";

export interface ImageGrid2x2Props {
  images: { url: string; alt?: string }[];
}

export default function ImageGrid2x2({ images }: ImageGrid2x2Props) {
  const items = images.slice(0, 4);
  return (
    <section className={styles.grid}>
      {items.map((img, idx) => (
        <div key={idx} className={styles.cell}>
          <Image src={img.url} alt={img.alt ?? ""} width={600} height={600} />
        </div>
      ))}
    </section>
  );
}
