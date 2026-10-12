import { useEffect, useState, type ComponentProps } from "react";
import type { IconType } from "react-icons";
import { BiPencil, BiTrash } from "react-icons/bi";
import { CgEyeAlt } from "react-icons/cg";
import { getPageText, type PageConfig } from "../utils/pageConfig";

const fixedIcons: Record<string, IconType> = {
  BiPencil,
  BiTrash,
  CgEyeAlt,
};

type ConfiguredIconProps = ComponentProps<IconType> & {
  pages: PageConfig;
  setting: string;
};

export const ConfiguredIcon = ({
  pages,
  setting,
  ...iconProps
}: ConfiguredIconProps) => {
  const name = getPageText(pages, setting);
  const [loadedIcon, setLoadedIcon] = useState<{
    name: string;
    icon: IconType;
  } | null>(null);
  const [loadError, setLoadError] = useState<{
    name: string;
    error: Error;
  } | null>(null);

  useEffect(() => {
    if (!name || fixedIcons[name] || !name.startsWith("Bs")) return;
    let active = true;

    void import("react-icons/bs")
      .then((icons) => {
        const icon = icons[name as keyof typeof icons];
        if (typeof icon !== "function") {
          throw new Error(`Unknown Bootstrap icon "${name}" in page configuration.`);
        }
        return icon as IconType;
      })
      .then((icon) => {
        if (active) setLoadedIcon({ name, icon });
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError({
            name,
            error:
              error instanceof Error
                ? error
                : new Error(String(error)),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [name]);

  if (name && !fixedIcons[name] && !name.startsWith("Bs")) {
    throw new Error(`Unknown icon "${name}" in page configuration.`);
  }
  if (loadError?.name === name) throw loadError.error;
  const Icon =
    fixedIcons[name] ??
    (loadedIcon?.name === name ? loadedIcon.icon : null);
  if (!Icon) return null;

  return <Icon {...iconProps} />;
};
