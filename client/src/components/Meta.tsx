import { Helmet } from "react-helmet";

interface MetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: "website" | "article";
  twitterCard?: "summary" | "summary_large_image";
  jsonLd?: object;
}

const DEFAULT_TITLE = "Bitnox Technology Solutions";
const DEFAULT_DESCRIPTION =
  "Elevate your business with comprehensive IT solutions tailored to your needs. From web development to cloud infrastructure, we deliver excellence in every project.";
const DEFAULT_KEYWORDS =
  "software solution, hardware solution, cleaning, laundry, tech training, IT consultation, cybersecurity, digital marketing, technology center, oke ilewo, abeokuta, nigeria, bitnox solutions, bitnox technology";
const DEFAULT_OG_IMAGE = "https://bitnoxsolution.com/og-image.png";

const Meta = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  ogImage = DEFAULT_OG_IMAGE,
  ogUrl,
  ogType = "website",
  twitterCard = "summary_large_image",
  jsonLd,
}: MetaProps) => {
  const resolvedUrl =
    ogUrl || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={resolvedUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Bitnox Technology Solutions" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default Meta;
