import { useEffect, useState } from "react";

export default function useTyping(words, speed = 80, pause = 1500) {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[index % words.length];
    const next = deleting
      ? current.slice(0, text.length - 1)
      : current.slice(0, text.length + 1);

    if (!deleting && next === current) {
      const timeout = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(timeout);
    }

    if (deleting && next === "") {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
    }

    const timeout = setTimeout(() => setText(next), deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [text, deleting, index, words, speed, pause]);

  return text;
}
