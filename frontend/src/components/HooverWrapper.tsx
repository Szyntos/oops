import { ReactElement, useState } from "react";

type HooverWrapperProps = {
  children: ReactElement;
  opacity?: number;
};

export const HooverWrapper = ({
  children,
  opacity = 0.9,
}: HooverWrapperProps) => {
  const [isHoovered, setIsHoovered] = useState(false);

  return (
    <div
      style={{ opacity: isHoovered ? opacity : 1 }}
      onMouseEnter={() => setIsHoovered(true)}
      onMouseLeave={() => setIsHoovered(false)}
    >
      {children}
    </div>
  );
};
