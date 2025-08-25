"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { EquipmentCondition, CertificationStandard } from "@prisma/client";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

interface CertificationData {
  certificationNumber: string;
  standard: CertificationStandard;
  certifyingBody: string;
  issueDate: Date | undefined;
  expiryDate: Date | undefined;
  documentUrl: string;
}

interface FormData {
  title: string;
  description: string;
  priceCents: string;
  category: string;
  condition: EquipmentCondition;
  location: string;
  images: string[];
  certifications: CertificationData[];
}

const EQUIPMENT_CATEGORIES = [
  "Tractor",
  "Harvester",
  "Tiller",
  "Irrigation System",
  "Seeder",
  "Sprayer",
  "Plow",
  "Cultivator",
  "Other"
];

const CONDITION_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "USED", label: "Used" },
  { value: "REFURBISHED", label: "Refurbished" }
];

const CERTIFICATION_STANDARDS = [
  { value: "ISO_9001", label: "ISO 9001 - Quality Management" },
  { value: "AGMARK", label: "AGMARK - Agricultural Marketing" },
  { value: "FSSAI", label: "FSSAI - Food Safety" },
  { value: "GMP", label: "GMP - Good Manufacturing Practice" },
  { value: "HACCP", label: "HACCP - Food Safety Management" },
  { value: "ORGANIC_CERTIFICATION", label: "Organic Certification" },
  { value: "EXPORT_CERTIFICATE", label: "Export Certificate" },
  { value: "QUALITY_ASSURANCE", label: "Quality Assurance" },
  { value: "SAFETY_CERTIFICATE", label: "Safety Certificate" },
  { value: "ENVIRONMENTAL_CERTIFICATION", label: "Environmental Certification" }
];

export default function NewEquipmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    priceCents: "",
    category: "",
    condition: "NEW" as EquipmentCondition,
    location: "",
    images: [],
    certifications: []
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleInputChange = (field: keyof FormData, value: string | string[] | EquipmentCondition) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          certificationNumber: "",
          standard: "ISO_9001" as CertificationStandard,
          certifyingBody: "",
          issueDate: undefined,
          expiryDate: undefined,
          documentUrl: ""
        }
      ]
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const updateCertification = (index: number, field: keyof CertificationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) =>
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const handleUploadComplete = (res: any[]) => {
    const uploadedUrls = res.map(file => file.url);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls]
    }));

    toast({
      title: "Success",
      description: `${res.length} image(s) uploaded successfully`,
    });
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
    toast({
      title: "Error",
      description: "Failed to upload images. Please try again.",
      variant: "destructive",
    });
  };

  const handleCertificationDocumentUpload = (index: number, res: any[]) => {
    const uploadedUrl = res[0].url;
    updateCertification(index, "documentUrl", uploadedUrl);
    toast({
      title: "Success",
      description: "Certification document uploaded successfully",
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.priceCents || parseInt(formData.priceCents) <= 0) {
      newErrors.priceCents = "Valid price is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (formData.images.length === 0) {
      toast({
        title: "Images Required",
        description: "Please upload at least one image of your equipment",
        variant: "destructive",
      });
      return false;
    }

    // Validate certifications - at least one required
    const validCertifications = formData.certifications.filter(cert =>
      cert.certificationNumber.trim() &&
      cert.certifyingBody.trim() &&
      cert.issueDate &&
      cert.expiryDate
    );

    if (validCertifications.length === 0) {
      toast({
        title: "Certifications Required",
        description: "Please add at least one complete certification for your equipment",
        variant: "destructive",
      });
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Validate certifications - only include complete ones
      const validCertifications = formData.certifications.filter(cert =>
        cert.certificationNumber.trim() &&
        cert.certifyingBody.trim() &&
        cert.issueDate &&
        cert.expiryDate
      );

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priceCents: parseInt(formData.priceCents),
        category: formData.category,
        condition: formData.condition,
        location: formData.location.trim(),
        images: formData.images,
        certifications: validCertifications
      };

      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your equipment has been listed successfully",
        });

        // Redirect to equipment management page
        router.push('/dashboard/sell/equipment');
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create equipment listing",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating equipment:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen ">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-8  rounded animate-pulse" />
            <div className="h-64  rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard requiredRole="FARMER">
      <div className="min-h-screen ">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/sell/equipment">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Equipment
              </Button>
            </Link>
            <div>
                <h1 className="text-3xl font-bold ">
                Add New Equipment
              </h1>
              <p className="">
                List your agricultural equipment for sale
              </p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Equipment Title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={(value) => handleInputChange("title", value)}
                    placeholder="e.g., John Deere 5055E Tractor"
                    required
                    error={errors.title}
                    hint="Choose a descriptive title that includes make, model, and key features"
                  />

                  <FormField
                    label="Category"
                    name="category"
                    type="select"
                    value={formData.category}
                    onChange={(value) => handleInputChange("category", value)}
                    options={EQUIPMENT_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                    required
                    error={errors.category}
                    hint="Select the most appropriate category for your equipment"
                  />
                </div>

                <FormField
                  label="Description"
                  name="description"
                  type="textarea"
                  value={formData.description}
                  onChange={(value) => handleInputChange("description", value)}
                  placeholder="Provide detailed information about your equipment including specifications, condition, usage hours, maintenance history, etc."
                  required
                  error={errors.description}
                  hint="Include as much detail as possible to attract serious buyers"
                  rows={4}
                />

                {/* Price and Condition */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Price (₹)"
                    name="priceCents"
                    type="number"
                    value={formData.priceCents}
                    onChange={(value) => handleInputChange("priceCents", value)}
                    placeholder="Enter price in rupees"
                    required
                    error={errors.priceCents}
                    hint="Enter the full price in Indian Rupees"
                  />

                  <FormField
                    label="Condition"
                    name="condition"
                    type="select"
                    value={formData.condition}
                    onChange={(value) => handleInputChange("condition", value as EquipmentCondition)}
                    options={CONDITION_OPTIONS}
                    required
                    hint="Select the current condition of your equipment"
                  />
                </div>

                <FormField
                  label="Location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={(value) => handleInputChange("location", value)}
                  placeholder="e.g., Punjab, India or New Delhi, Delhi"
                  required
                  error={errors.location}
                  hint="Specify the city and state where the equipment is located"
                />

                {/* Certifications Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium  mb-1">
                        Certifications <span className="text-red-500">*</span>
                      </label>
                      <p className="text-sm ">
                        Add certifications to build trust with buyers (at least one required)
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCertification}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Certification
                    </Button>
                  </div>

                  {formData.certifications.map((certification, index) => (
                    <Card key={index} className="border-dashed">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium ">
                            Certification #{index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCertification(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium  mb-1">
                              Certification Number *
                            </label>
                            <Input
                              type="text"
                              value={certification.certificationNumber}
                              onChange={(e) => updateCertification(index, "certificationNumber", e.target.value)}
                              placeholder="e.g., ISO9001-2023-001"
                              className="w-full px-3 py-2  rounded-md "
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium  mb-1">
                              Certification Standard *
                            </label>
                            <select
                              value={certification.standard}
                              onChange={(e) => updateCertification(index, "standard", e.target.value as CertificationStandard)}
                              className="w-full px-3 py-2 rounded-md bg-gray-900"
                              required
                            >
                              {CERTIFICATION_STANDARDS.map((option) => (
                                <option className="bg-gray-900" key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium  mb-1">
                              Certifying Body *
                            </label>
                            <Input
                              type="text"
                              value={certification.certifyingBody}
                              onChange={(e) => updateCertification(index, "certifyingBody", e.target.value)}
                              placeholder="e.g., Bureau of Indian Standards"
                              className="w-full px-3 py-2 rounded-md bg-none"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium  mb-1">
                                Issue Date *
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                  >
                                    {certification.issueDate ? (
                                      format(certification.issueDate, "PPP")
                                    ) : (
                                      <span className="text-gray-500">Pick a date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={certification.issueDate}
                                    onSelect={(date) => updateCertification(index, "issueDate", date)}
                                    
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div>
                              <label className="block text-sm font-medium  mb-1">
                                Expiry Date *
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                  >
                                    {certification.expiryDate ? (
                                      format(certification.expiryDate, "PPP")
                                    ) : (
                                      <span className="text-gray-500">Pick a date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={certification.expiryDate}
                                    onSelect={(date) => updateCertification(index, "expiryDate", date)}
                                    initialFocus
                                    className="w-full"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        </div>

                        {/* Document Upload */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium  mb-2">
                            Certification Document (Optional)
                          </label>
                          {certification.documentUrl ? (
                            <div className="flex items-center gap-2 p-2 border rounded-md">
                              <span className="text-sm text-green-600">Document uploaded</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => updateCertification(index, "documentUrl", "")}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm  mb-2">
                                Upload certification document (PDF, JPG, PNG - max 4MB)
                              </p>
                              <UploadButton<OurFileRouter, "equipmentImage">
                                endpoint="equipmentImage"
                                onClientUploadComplete={(res) => handleCertificationDocumentUpload(index, res)}
                                onUploadError={handleUploadError}
                                appearance={{
                                  button: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm",
                                  allowedContent: "hidden"
                                }}
                                content={{
                                  button: "Upload Document",
                                  allowedContent: "PDF/JPG/PNG up to 4MB"
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium  mb-2">
                    Equipment Images <span className="text-red-500">*</span>
                  </label>

                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm  mb-4">
                        Upload high-quality images of your equipment (max 5 images, 4MB each)
                      </p>

                      <UploadButton<OurFileRouter, "equipmentImage">
                        endpoint="equipmentImage"
                        onClientUploadComplete={handleUploadComplete}
                        onUploadError={handleUploadError}
                        appearance={{
                          button: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md",
                          allowedContent: "hidden"
                        }}
                        content={{
                          button: "Choose Images",
                          allowedContent: "Images up to 4MB"
                        }}
                      />
                    </div>

                    {/* Image Preview */}
                    {formData.images.length > 0 && (
                      <div className="mt-4">
                          <p className="text-sm  mb-2">
                          {formData.images.length} image(s) uploaded
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`Equipment ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 w-6 h-6 p-0"
                                onClick={() => removeImage(index)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-6">
                  <Link href="/dashboard/equipment">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Listing...
                      </>
                    ) : (
                      "Create Equipment Listing"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
