import HomeClient from "./HomeClient";
import {
  SITE_URL,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  buildSocialMetadata,
} from "@/config/seo";

const socialMetadata = buildSocialMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  url: SITE_URL,
});

export const metadata = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  ...socialMetadata,
};

export default function HomePage() {
  return <HomeClient />;
}
