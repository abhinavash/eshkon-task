import { GraphQLClient, gql } from "graphql-request";
import { config } from "./config";

export function getContentfulClient(preview: boolean = false) {
  const token = preview ? config.contentful.previewToken : config.contentful.deliveryToken;
  const endpoint = `https://graphql.contentful.com/content/v1/spaces/${config.contentful.spaceId}/environments/${config.contentful.environment}`;
  return new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export const QUERIES = {
  pageSlugs: gql`
    query PageSlugs {
      pageCollection(limit: 50) {
        items { slug }
      }
    }
  `,
  pageBySlug: gql`
    query PageBySlug($slug: String!) {
      pageCollection(limit: 1, where: { slug: $slug }) {
        items {
          sys { id }
          slug
          title
          layoutConfig
        }
      }
    }
  `,
  blockById: gql`
    query BlockById($id: String!) {
      hero: hero(id: $id) {
        sys { id }
        heading
        subtitle
        ctaLabel
        ctaHref
        backgroundImage { url }
      }
      twoCol: twoColumnRow(id: $id) {
        sys { id }
        leftHeading
        leftSubtitle
        leftCtaLabel
        leftCtaHref
        rightImage { url }
      }
      asset: asset(id: $id) {
        sys { id }
        url
        title
      }
    }
  `,
};
