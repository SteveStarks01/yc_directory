import { defineField, defineType } from "sanity";
import { DownloadIcon } from "lucide-react";

export const resourceDownload = defineType({
  name: "resourceDownload",
  title: "Resource Download",
  type: "document",
  icon: DownloadIcon,
  fields: [
    defineField({
      name: "resource",
      title: "Resource",
      type: "reference",
      to: [{ type: "resource" }],
      validation: (Rule) => Rule.required(),
      description: "The resource that was downloaded",
    }),
    defineField({
      name: "user",
      title: "User",
      type: "reference",
      to: [{ type: "userProfile" }],
      description: "Who downloaded the resource (null for anonymous downloads)",
    }),
    defineField({
      name: "downloadedAt",
      title: "Downloaded At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ipAddress",
      title: "IP Address",
      type: "string",
      description: "IP address of the downloader (for analytics)",
    }),
    defineField({
      name: "userAgent",
      title: "User Agent",
      type: "string",
      description: "Browser/device information",
    }),
    defineField({
      name: "referrer",
      title: "Referrer",
      type: "string",
      description: "Where the user came from",
    }),
    defineField({
      name: "downloadMethod",
      title: "Download Method",
      type: "string",
      options: {
        list: [
          { title: "Direct Download", value: "direct" },
          { title: "External Link", value: "external" },
          { title: "Streaming", value: "stream" },
          { title: "Email Delivery", value: "email" },
        ],
      },
      initialValue: "direct",
      description: "How the resource was accessed",
    }),
    defineField({
      name: "fileSize",
      title: "File Size (bytes)",
      type: "number",
      description: "Size of the downloaded file in bytes",
    }),
    defineField({
      name: "downloadDuration",
      title: "Download Duration (ms)",
      type: "number",
      description: "How long the download took in milliseconds",
    }),
    defineField({
      name: "successful",
      title: "Successful Download",
      type: "boolean",
      initialValue: true,
      description: "Whether the download completed successfully",
    }),
    defineField({
      name: "errorMessage",
      title: "Error Message",
      type: "string",
      description: "Error message if download failed",
    }),
    defineField({
      name: "sessionId",
      title: "Session ID",
      type: "string",
      description: "User session identifier for tracking",
    }),
    defineField({
      name: "metadata",
      title: "Additional Metadata",
      type: "object",
      fields: [
        defineField({
          name: "country",
          title: "Country",
          type: "string",
          description: "User's country (from IP geolocation)",
        }),
        defineField({
          name: "city",
          title: "City",
          type: "string",
          description: "User's city (from IP geolocation)",
        }),
        defineField({
          name: "device",
          title: "Device Type",
          type: "string",
          options: {
            list: [
              { title: "Desktop", value: "desktop" },
              { title: "Mobile", value: "mobile" },
              { title: "Tablet", value: "tablet" },
              { title: "Unknown", value: "unknown" },
            ],
          },
        }),
        defineField({
          name: "browser",
          title: "Browser",
          type: "string",
          description: "Browser name and version",
        }),
        defineField({
          name: "os",
          title: "Operating System",
          type: "string",
          description: "Operating system information",
        }),
      ],
      description: "Additional tracking information",
    }),
  ],
  preview: {
    select: {
      resourceTitle: "resource.title",
      userName: "user.userId",
      downloadedAt: "downloadedAt",
      successful: "successful",
    },
    prepare(selection) {
      const { resourceTitle, userName, downloadedAt, successful } = selection;
      const date = downloadedAt 
        ? new Date(downloadedAt).toLocaleDateString() 
        : "Unknown date";
      
      return {
        title: `${resourceTitle || "Unknown Resource"}`,
        subtitle: `${userName || "Anonymous"} • ${date} ${!successful ? "(Failed)" : ""}`,
      };
    },
  },
  orderings: [
    {
      title: "Download Date, New",
      name: "downloadedDesc",
      by: [{ field: "downloadedAt", direction: "desc" }],
    },
    {
      title: "Download Date, Old",
      name: "downloadedAsc",
      by: [{ field: "downloadedAt", direction: "asc" }],
    },
  ],
});
