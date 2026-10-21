export type RecentFileItem = {
  id: string;
  name: string;
  kind: "pdf" | "image";
  detail: string;
  originalSize: string;
  newSize: string;
  saved: string;
  date: string;
};

export const recentFiles: RecentFileItem[] = [
  {
    id: "1",
    name: "Job Offer Document.pdf",
    kind: "pdf",
    detail: "Compressed with Optimized preset",
    originalSize: "2.4 MB",
    newSize: "105 KB",
    saved: "-95%",
    date: "Just now",
  },
  {
    id: "2",
    name: "Passport Scan.pdf",
    kind: "pdf",
    detail: "Compressed with Bright preset",
    originalSize: "4.8 MB",
    newSize: "1.4 MB",
    saved: "-71%",
    date: "2 hours ago",
  },
  {
    id: "3",
    name: "Design Portfolio.pdf",
    kind: "pdf",
    detail: "Merged 4 documents",
    originalSize: "8.2 MB",
    newSize: "5.1 MB",
    saved: "-38%",
    date: "Yesterday",
  },
  {
    id: "4",
    name: "Hero_Banner.png",
    kind: "image",
    detail: "Converted to WebP",
    originalSize: "1.8 MB",
    newSize: "320 KB",
    saved: "-82%",
    date: "3 days ago",
  },
];
