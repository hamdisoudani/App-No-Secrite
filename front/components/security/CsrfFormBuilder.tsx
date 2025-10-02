'use client';

import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormField {
  name: string;
  value: string;
}

export function CsrfFormBuilder() {
  const formRef = useRef<HTMLFormElement>(null);
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('get');
  const [enctype, setEnctype] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [newField, setNewField] = useState({ name: '', value: '' });
  const [savedForm, setSavedForm] = useState('');
  const [result, setResult] = useState('');

  const addField = () => {
    if (newField.name) {
      setFields([...fields, newField]);
      setNewField({ name: '', value: '' });
    }
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const exportForm = () => {
    if (formRef.current) {
      const formData = {
        html: formRef.current.innerHTML,
        action: url,
        method: method,
        enctype: enctype
      };
      setSavedForm(JSON.stringify(formData));
    }
  };

  const importForm = () => {
    try {
      const formData = JSON.parse(savedForm);
      if (formRef.current) {
        formRef.current.innerHTML = formData.html;
        setUrl(formData.action);
        setMethod(formData.method);
        setEnctype(formData.enctype);
      }
    } catch (err) {
      console.error('Invalid form data:', err);
    }
  };

  const attemptCsrf = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setResult('Error: No authentication token found. Please log in first.');
        return;
      }

      const formData = Object.fromEntries(
        fields.map(field => [field.name, field.value])
      );

      console.log('Attempting request to:', url);
      console.log('Method:', method.toUpperCase());
      console.log('Data:', formData);

      const response = await fetch(url, {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: method !== 'GET' ? JSON.stringify(formData) : undefined
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('CSRF test failed:', {
        error: err,
        url,
        method,
        fields
      });
      setResult(`Error: ${errorMessage}\n\nPlease check:\n1. Is the backend server running?\n2. Is the URL correct?\n3. Are you logged in?`);
    }
  };

  return (
    <Card className="w-full csrf-form-builder">
      <CardHeader>
        <CardTitle>CSRF Form Builder</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Target URL</label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/api/endpoint"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Method</label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="get">GET</SelectItem>
                    <SelectItem value="post">POST</SelectItem>
                    <SelectItem value="patch">PATCH</SelectItem>
                    <SelectItem value="put">PUT</SelectItem>
                    <SelectItem value="delete">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Enctype</label>
                <Select value={enctype} onValueChange={setEnctype}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select encoding type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="application/x-www-form-urlencoded">Default</SelectItem>
                    <SelectItem value="multipart/form-data">multipart/form-data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Field Name"
                value={newField.name}
                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
              />
              <Input
                placeholder="Field Value"
                value={newField.value}
                onChange={(e) => setNewField({ ...newField, value: e.target.value })}
              />
            </div>
            <Button onClick={addField}>Add Field</Button>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Form Preview</h3>
            <form
              ref={formRef}
              method={method}
              action={url}
              encType={enctype || undefined}
              target="csrf-result"
            >
              {fields.map((field, index) => (
                <div key={index} className="flex items-center gap-4 mb-2">
                  <label className="text-sm">{field.name}</label>
                  <Input
                    name={field.name}
                    defaultValue={field.value}
                    className="flex-1"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeField(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </form>
          </div>

          <div className="grid gap-4">
            <textarea
              className="w-full h-32 p-2 border rounded"
              value={savedForm}
              onChange={(e) => setSavedForm(e.target.value)}
              placeholder="Export/Import form data here..."
            />
            <div className="flex gap-4">
              <Button onClick={exportForm}>Export Form</Button>
              <Button onClick={importForm}>Import Form</Button>
              <Button variant="destructive" onClick={attemptCsrf}>
                Test CSRF
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Result:</h3>
            <textarea
              className="w-full h-32 p-2 border rounded"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Result will appear here..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}