'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FileTextIcon, 
  DownloadIcon, 
  StarIcon, 
  EyeIcon,
  SearchIcon,
  FilterIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { 
  ResourceSummary, 
  getResourceTypeIcon, 
  getResourceTypeLabel,
  getDifficultyLabel,
  getDifficultyColor,
  getAccessLevelIcon,
  formatDownloadCount,
  formatRating
} from '@/lib/resources';

interface ResourcesListProps {
  initialResources?: ResourceSummary[];
  showFilters?: boolean;
  limit?: number;
}

export default function ResourcesList({ 
  initialResources = [], 
  showFilters = true, 
  limit 
}: ResourcesListProps) {
  const { data: session } = useSession();
  const [resources, setResources] = useState<ResourceSummary[]>(initialResources);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFeatured, setShowFeatured] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [searchTerm, selectedType, selectedDifficulty, selectedCategory, showFeatured, limit]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedType) params.append('type', selectedType);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);
      if (selectedCategory) params.append('category', selectedCategory);
      if (showFeatured) params.append('featured', 'true');
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`/api/resources?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setResources(data.resources || []);
      } else {
        console.error('Error fetching resources:', data.error);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resourceId: string) => {
    try {
      const response = await fetch(`/api/resources/${resourceId}/download`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.downloadUrl) {
          // Open download URL
          window.open(data.downloadUrl, '_blank');
        }
        // Refresh resources to update download counts
        fetchResources();
      } else {
        alert(data.error || 'Failed to download resource');
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      alert('Failed to download resource');
    }
  };

  const resourceTypes = [
    { value: '', label: 'All Types' },
    { value: 'pdf', label: 'PDF Document' },
    { value: 'video', label: 'Video' },
    { value: 'template', label: 'Template' },
    { value: 'tool', label: 'Tool/Software' },
    { value: 'course', label: 'Course' },
    { value: 'book', label: 'Book/eBook' },
    { value: 'article', label: 'Article' },
    { value: 'research', label: 'Research' },
  ];

  const difficulties = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {resourceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showFeatured}
                  onChange={(e) => setShowFeatured(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Featured Only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Resources Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div key={resource._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Resource Thumbnail */}
              <div className="relative h-48 bg-gray-100">
                {resource.thumbnailImage ? (
                  <Image
                    src={resource.thumbnailImage}
                    alt={resource.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-4xl">
                      {getResourceTypeIcon(resource.resourceType)}
                    </span>
                  </div>
                )}
                
                {/* Featured Badge */}
                {resource.featured && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <StarIcon className="w-3 h-3" />
                      <span>Featured</span>
                    </span>
                  </div>
                )}

                {/* Access Level Badge */}
                <div className="absolute top-3 right-3">
                  <span className="bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <span>{getAccessLevelIcon(resource.accessLevel)}</span>
                  </span>
                </div>

                {/* Price Badge */}
                {!resource.price.isFree && (
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      ${resource.price.amount} {resource.price.currency}
                    </span>
                  </div>
                )}
              </div>

              {/* Resource Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {resource.title}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {resource.description}
                </p>

                {/* Resource Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium">{getResourceTypeLabel(resource.resourceType)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Difficulty:</span>
                    <span className={`font-medium text-${getDifficultyColor(resource.difficulty)}-600`}>
                      {getDifficultyLabel(resource.difficulty)}
                    </span>
                  </div>

                  {resource.estimatedTime && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Time:</span>
                      <span className="font-medium">{resource.estimatedTime}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Author:</span>
                    <span className="font-medium">{resource.author.userId}</span>
                  </div>
                </div>

                {/* Category and Tags */}
                <div className="mb-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {resource.category.name}
                  </span>
                  {resource.tags && resource.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="ml-2 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <DownloadIcon className="w-4 h-4" />
                      <span>{formatDownloadCount(resource.downloadCount)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{formatDownloadCount(resource.viewCount)}</span>
                    </div>
                    {resource.rating.count > 0 && (
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                        <span>{formatRating(resource.rating)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Link
                    href={`/resources/${resource.slug.current}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    View Details
                  </Link>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(resource._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors flex items-center space-x-1"
                    >
                      <DownloadIcon className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedType || selectedDifficulty 
              ? 'Try adjusting your search or filters'
              : 'No resources have been added yet'
            }
          </p>
          {session && (
            <Link
              href="/resources/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Resource
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
