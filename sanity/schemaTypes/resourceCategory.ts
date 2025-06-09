import { defineField, defineType } from "sanity";
import { FolderIcon } from "lucide-react";

export const resourceCategory = defineType({
  name: "resourceCategory",
  title: "Resource Category",
  type: "document",
  icon: FolderIcon,
  fields: [
    defineField({
      name: "name",
      title: "Category Name",
      type: "string",
      validation: (Rule) => Rule.required().max(50),
      description: "Name of the resource category",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: "URL-friendly version of the category name",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Brief description of what this category contains",
    }),
    defineField({
      name: "icon",
      title: "Category Icon",
      type: "string",
      options: {
        list: [
          { title: "📚 Books & Guides", value: "books" },
          { title: "🎥 Videos & Tutorials", value: "videos" },
          { title: "📊 Templates & Tools", value: "templates" },
          { title: "📄 Documents & Reports", value: "documents" },
          { title: "🎨 Design Resources", value: "design" },
          { title: "💻 Code & Development", value: "code" },
          { title: "💰 Funding & Investment", value: "funding" },
          { title: "📈 Marketing & Growth", value: "marketing" },
          { title: "⚖️ Legal & Compliance", value: "legal" },
          { title: "🏢 Operations & Management", value: "operations" },
          { title: "🎯 Strategy & Planning", value: "strategy" },
          { title: "🔧 Other Resources", value: "other" },
        ],
      },
      initialValue: "other",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "color",
      title: "Category Color",
      type: "string",
      options: {
        list: [
          { title: "Blue", value: "blue" },
          { title: "Green", value: "green" },
          { title: "Purple", value: "purple" },
          { title: "Red", value: "red" },
          { title: "Orange", value: "orange" },
          { title: "Yellow", value: "yellow" },
          { title: "Pink", value: "pink" },
          { title: "Indigo", value: "indigo" },
          { title: "Gray", value: "gray" },
        ],
      },
      initialValue: "blue",
      description: "Color theme for this category",
    }),
    defineField({
      name: "parentCategory",
      title: "Parent Category",
      type: "reference",
      to: [{ type: "resourceCategory" }],
      description: "Parent category for hierarchical organization",
    }),
    defineField({
      name: "featured",
      title: "Featured Category",
      type: "boolean",
      initialValue: false,
      description: "Show this category prominently on the resources page",
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      initialValue: 0,
      description: "Order in which categories are displayed (lower numbers first)",
    }),
    defineField({
      name: "isActive",
      title: "Active Category",
      type: "boolean",
      initialValue: true,
      description: "Whether this category is active and visible",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
      description: "Last time this category was modified",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "description",
      icon: "icon",
      active: "isActive",
    },
    prepare(selection) {
      const { title, subtitle, icon, active } = selection;
      const iconMap: Record<string, string> = {
        books: "📚",
        videos: "🎥",
        templates: "📊",
        documents: "📄",
        design: "🎨",
        code: "💻",
        funding: "💰",
        marketing: "📈",
        legal: "⚖️",
        operations: "🏢",
        strategy: "🎯",
        other: "🔧",
      };
      
      return {
        title: `${iconMap[icon] || "📁"} ${title || "Untitled Category"}`,
        subtitle: `${subtitle || "No description"} ${!active ? "(Inactive)" : ""}`,
      };
    },
  },
  orderings: [
    {
      title: "Sort Order",
      name: "sortOrder",
      by: [{ field: "sortOrder", direction: "asc" }],
    },
    {
      title: "Name A-Z",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
    {
      title: "Created Date, New",
      name: "createdDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
  ],
});
