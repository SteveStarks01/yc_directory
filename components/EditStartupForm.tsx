"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface StartupData {
  _id: string;
  name: string;
  tagline?: string;
  description: string;
  category: string;
  link: string;
  pitch: string;
  image?: any;
}

interface EditStartupFormProps {
  startup: StartupData;
}

const EditStartupForm = ({ startup }: EditStartupFormProps) => {
  const [formData, setFormData] = useState({
    title: startup.name || "",
    description: startup.description || "",
    category: startup.category || "",
    link: startup.link || "",
    pitch: startup.pitch || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }
    if (!formData.link.trim()) {
      newErrors.link = "Link is required";
    } else if (!/^https?:\/\/.+/.test(formData.link)) {
      newErrors.link = "Please enter a valid URL";
    }
    if (!formData.pitch.trim()) {
      newErrors.pitch = "Pitch is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/startups/${startup._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.title,
          description: formData.description,
          category: formData.category,
          link: formData.link,
          pitch: formData.pitch,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Success",
          description: "Your startup has been updated successfully!",
        });
        router.push("/dashboard");
      } else {
        throw new Error(result.error || "Failed to update startup");
      }
    } catch (error) {
      console.error("Error updating startup:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update startup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="startup-form_container">
      <div className="startup-form">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Edit Startup</h2>
        </div>

        <form onSubmit={handleSubmit} className="startup-form_form">
          <div>
            <label htmlFor="title" className="startup-form_label">
              Title
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="startup-form_input"
              required
              placeholder="Startup Title"
            />
            {errors.title && <p className="startup-form_error">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="startup-form_label">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="startup-form_textarea"
              required
              placeholder="Describe your startup"
            />
            {errors.description && <p className="startup-form_error">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="category" className="startup-form_label">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="startup-form_input"
              required
            >
              <option value="">Select a category</option>
              <option value="Tech">Tech</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Finance">Finance</option>
              <option value="E-commerce">E-commerce</option>
              <option value="SaaS">SaaS</option>
              <option value="AI/ML">AI/ML</option>
              <option value="Blockchain">Blockchain</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <p className="startup-form_error">{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="link" className="startup-form_label">
              Website/Demo Link
            </label>
            <Input
              id="link"
              name="link"
              type="url"
              value={formData.link}
              onChange={handleInputChange}
              className="startup-form_input"
              required
              placeholder="https://your-startup.com"
            />
            {errors.link && <p className="startup-form_error">{errors.link}</p>}
          </div>

          <div>
            <label htmlFor="pitch" className="startup-form_label">
              Pitch
            </label>
            <Textarea
              id="pitch"
              name="pitch"
              value={formData.pitch}
              onChange={handleInputChange}
              className="startup-form_textarea min-h-[200px]"
              required
              placeholder="Describe your startup idea and what problem it solves"
            />
            {errors.pitch && <p className="startup-form_error">{errors.pitch}</p>}
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="startup-form_btn text-white flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Startup"}
              <Send className="size-6 ml-2" />
            </Button>
            
            <Link href="/dashboard">
              <Button type="button" variant="outline" className="px-8">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditStartupForm;
