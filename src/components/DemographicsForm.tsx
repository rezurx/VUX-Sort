import React, { useState } from 'react';
import { User, CheckCircle, AlertCircle } from 'lucide-react';
import { DemographicField } from '../types';

interface DemographicsFormProps {
  fields: DemographicField[];
  onSubmit: (demographics: Record<string, any>, participantInfo: { name?: string; email?: string }) => void;
  onSkip?: () => void;
  allowSkip?: boolean;
  studyName?: string;
}

const DemographicsForm: React.FC<DemographicsFormProps> = ({
  fields,
  onSubmit,
  onSkip,
  allowSkip = true,
  studyName
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    fields.forEach(field => {
      if (field.required && (!formData[field.id] || formData[field.id] === '')) {
        newErrors[field.id] = `${field.name} is required`;
      }

      // Type-specific validation
      if (formData[field.id]) {
        const value = formData[field.id];
        
        switch (field.type) {
          case 'number':
            const num = Number(value);
            if (isNaN(num)) {
              newErrors[field.id] = 'Please enter a valid number';
            } else if (field.validation?.min !== undefined && num < field.validation.min) {
              newErrors[field.id] = `Value must be at least ${field.validation.min}`;
            } else if (field.validation?.max !== undefined && num > field.validation.max) {
              newErrors[field.id] = `Value must be at most ${field.validation.max}`;
            }
            break;

          case 'text':
            if (field.validation?.pattern) {
              const regex = new RegExp(field.validation.pattern);
              if (!regex.test(value)) {
                newErrors[field.id] = 'Please enter a valid format';
              }
            }
            break;

          case 'date':
            if (value && !isValidDate(value)) {
              newErrors[field.id] = 'Please enter a valid date';
            }
            break;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validateForm()) {
      const participantInfo = {
        name: participantName.trim() || undefined,
        email: participantEmail.trim() || undefined
      };
      onSubmit(formData, participantInfo);
    }
    
    setIsSubmitting(false);
  };

  const renderField = (field: DemographicField) => {
    const value = formData[field.id] || '';
    const hasError = !!errors[field.id];

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select an option...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multiSelect':
        return (
          <div className="space-y-2">
            {field.options?.map(option => {
              const selectedValues = Array.isArray(value) ? value : [];
              const isSelected = selectedValues.includes(option);
              
              return (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...selectedValues, option]
                        : selectedValues.filter(v => v !== option);
                      handleFieldChange(field.id, newValue);
                    }}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              );
            })}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{field.placeholder || 'Yes'}</span>
          </label>
        );

      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Participant Information</h1>
            {studyName && (
              <p className="text-gray-600">Study: {studyName}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Please provide some information about yourself before starting the study.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Optional participant identification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Dynamic demographic fields */}
            {fields.map(field => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {errors[field.id] && (
                  <div className="mt-1 flex items-center space-x-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors[field.id]}</span>
                  </div>
                )}
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p>No additional information required.</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Continue to Study</span>
                  </>
                )}
              </button>
              
              {allowSkip && onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Skip
                </button>
              )}
            </div>

            {/* Privacy note */}
            <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
              Your information will be kept confidential and used only for research purposes.
              You can withdraw from the study at any time.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DemographicsForm;