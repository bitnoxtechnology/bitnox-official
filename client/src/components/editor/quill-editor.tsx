// "use client";

// import React, { useEffect, useMemo, useRef } from "react";
// import "quill/dist/quill.snow.css";

// // type QuillType = typeof import("quill");

// export type QuillEditorProps = {
//   value: string;
//   onChange: (html: string) => void;
//   placeholder?: string;
//   modules?: any;
//   className?: string;
//   theme?: string; // default: "snow"
// };

// /**
//  * Lightweight Quill wrapper that works with React 19 (no findDOMNode).
//  * It instantiates Quill on a div and synchronizes HTML value via events.
//  */
// export default function QuillEditor({
//   value,
//   onChange,
//   placeholder,
//   modules,
//   className,
//   theme = "snow",
// }: QuillEditorProps) {
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const editorRef = useRef<HTMLDivElement | null>(null);
//   const quillRef = useRef<any>(null);

//   const resolvedModules = useMemo(
//     () =>
//       modules ?? {
//         toolbar: [
//           [{ header: [1, 2, 3, false] }],
//           ["bold", "italic", "underline", "strike"],
//           [{ list: "ordered" }, { list: "bullet" }],
//           ["link", "image", "blockquote", "code-block"],
//           ["clean"],
//         ],
//       },
//     [modules]
//   );

//   useEffect(() => {
//     let isMounted = true;

//     // let QuillImported: QuillType | null = null;

//     async function init() {
//       const { default: Quill } = await import("quill");
//       if (!isMounted) return;
//       // QuillImported = Quill;

//       if (!containerRef.current) return;
//       // Create inner editor element
//       const editorEl = document.createElement("div");
//       editorRef.current = editorEl;
//       containerRef.current.appendChild(editorEl);

//       const quill = new Quill(editorEl, {
//         placeholder,
//         modules: resolvedModules,
//         theme,
//       } as any);
//       quillRef.current = quill;

//       // Set initial value
//       if (value) {
//         quill.clipboard.dangerouslyPasteHTML(value);
//       }

//       // Listen to changes
//       const handler = () => {
//         const html = editorEl.querySelector(".ql-editor")?.innerHTML ?? "";
//         onChange(html);
//       };
//       quill.on("text-change", handler);
//     }

//     init();

//     return () => {
//       isMounted = false;
//       // Cleanup DOM we created
//       if (containerRef.current && editorRef.current) {
//         containerRef.current.removeChild(editorRef.current);
//       }
//       quillRef.current = null;
//       editorRef.current = null;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Keep external value in sync if it changes (e.g., programmatic set)
//   useEffect(() => {
//     const quill = quillRef.current;
//     const editorEl = editorRef.current;
//     if (!quill || !editorEl) return;
//     const currentHtml = editorEl.querySelector(".ql-editor")?.innerHTML ?? "";
//     if (value !== currentHtml) {
//       const selection = quill.getSelection();
//       quill.clipboard.dangerouslyPasteHTML(value || "");
//       if (selection) quill.setSelection(selection);
//     }
//   }, [value]);

//   return <div className={className} ref={containerRef} />;
// }
