import { Helmet } from "react-helmet";

interface MetaProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const Meta = ({ title, description, keywords }: MetaProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
    </Helmet>
  );
};

Meta.defaultProps = {
  title: "Bitnox Technology",
  description: `
   Elevate your business with comprehensive IT solutions tailored to your needs. 
   From web development to cloud infrastructure, we deliver excellence in every project.
   Our team of certified professionals brings over 8 years of industry expertise to 
   transform your digital presence and drive innovation.
  `,
  keywords:
    "software solution, hardware solution, cleaning, laundry, tech training, IT consultation, cybersecurity, digital marketing, technology center, oke ilewo, abeokuta, nigeria, bitnox solutions, bitnox technology",
};

export default Meta;
