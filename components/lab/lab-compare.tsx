"use client";
// Adonal vs D-76 with the shared Compare (owned by the digitization stream): explicit props only.
// Genuine lab scans (1400 × 928) — aspect and intrinsic size passed so nothing is cropped.
import {Compare} from '@/components/ui/compare';

export function LabCompare(){
 return <div className="lab-compare">
  <Compare firstImage="/images/scan-adonal-l.webp" secondImage="/images/scan-d76-l.webp" firstLabel="Adox Adonal 1+25 · 7:00" secondLabel="Kodak D-76 1+0 · 6:45"
   firstAlt="Echter Laborscan: Kodak Tri-X entwickelt in Adox Adonal 1+25, 7:00 Minuten" secondAlt="Echter Laborscan: Kodak Tri-X entwickelt in Kodak D-76 1+0, 6:45 Minuten"
   rangeLabel="Adonal- und D-76-Scan vergleichen" aspect="1400 / 928" imageWidth={1400} imageHeight={928} loading="lazy"/>
 </div>;
}
