"use client";

import dynamic from "next/dynamic";

type UserLocationMapProps = {
  latitude: number;
  longitude: number;
  radius?: number;
  heightClassName?: string;
};

const UserLocationMapClient = dynamic(
  () => import("./user-location-map-client"),
  {
    ssr: false,
  }
);

export function UserLocationMap(props: UserLocationMapProps) {
  return <UserLocationMapClient {...props} />;
}
