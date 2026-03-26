import { memo } from "react";

type FooterProps = {
  isVisible: boolean;
};

export const Footer = memo(function Footer({ isVisible }: FooterProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <p className="mt-6 text-center text-sm text-slate-400">
      Run an analysis to unlock copy and pull request actions for the improved README.
    </p>
  );
});
