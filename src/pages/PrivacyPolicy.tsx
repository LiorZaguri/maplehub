import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Layout from "@/components/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            onClick={() => window.history.back()} 
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                MapleHub ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, and safeguard your information 
                when you use our MapleStory toolkit application.
              </p>
              <p>
                By using MapleHub, you agree to the collection and use of information in 
                accordance with this policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Local Storage Data</h3>
                <p>
                  MapleHub stores the following data locally in your browser:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li><strong>Character Roster:</strong> Character names, classes, levels, experience, server type (Reboot/Regular), and progression data</li>
                  <li><strong>Boss Tracking:</strong> Boss completion status, party sizes, enabled/disabled bosses per character, and reset timestamps</li>
                  <li><strong>Task Management:</strong> Daily tasks, completion status, task presets, enabled tasks per character, and UI preferences (collapsed sections, hidden characters)</li>
                  <li><strong>Liberation Calculator:</strong> Selected characters, quest progress, traces held, start dates, and target goals</li>
                  <li><strong>Fragment Calculator:</strong> Selected characters and HEXA skill progression (current level, target level, completion status)</li>
                  <li><strong>Application Settings:</strong> Layout preferences (sidebar/topbar), navigation tools expansion state, auto-refresh settings</li>
                  <li><strong>Google Drive Integration:</strong> Authentication tokens for backup functionality (when used)</li>
                </ul>
                <p className="mt-2 text-sm text-muted-foreground">
                  This data is stored locally in your browser and is not transmitted to our servers.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Google Analytics</h3>
                <p>
                  We use Google Analytics to understand how our application is used. This includes:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Page views and navigation patterns</li>
                  <li>Feature usage statistics</li>
                  <li>Device and browser information</li>
                  <li>General location data (country/region level)</li>
                </ul>
                <p className="mt-2 text-sm text-muted-foreground">
                  Google Analytics data is anonymized and aggregated. We do not collect personally 
                  identifiable information through analytics.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Google Drive Integration</h3>
                <p>
                  When you choose to use Google Drive backup features, we:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Request permission to access your Google Drive</li>
                  <li>Create backup files containing your local MapleHub data</li>
                  <li>Store these backups in your personal Google Drive</li>
                  <li>Access these files only when you explicitly request backup/restore operations</li>
                </ul>
                <p className="mt-2 text-sm text-muted-foreground">
                  We do not access any other files in your Google Drive beyond the backup files 
                  created by MapleHub.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2">
                <li>To provide and maintain the MapleHub application</li>
                <li>To improve user experience and application functionality</li>
                <li>To analyze usage patterns and optimize performance</li>
                <li>To provide data backup and restore capabilities</li>
                <li>To communicate important updates or changes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Storage and Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Local Storage</h3>
                <p>
                  Your data is stored locally in your browser's storage. This data:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Remains on your device and is not transmitted to our servers</li>
                  <li>Can be cleared by clearing your browser's local storage</li>
                  <li>May be lost if you clear browser data or use a different device</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Google Drive Backups</h3>
                <p>
                  Backup files stored in your Google Drive are:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Encrypted and stored securely in your personal Google Drive</li>
                  <li>Accessible only to you and applications you authorize</li>
                  <li>Subject to Google's privacy and security policies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Access:</strong> You can view all your data stored locally in the application
                </li>
                <li>
                  <strong>Export:</strong> You can export your data at any time using the export feature
                </li>
                <li>
                  <strong>Delete:</strong> You can clear all local data by clearing your browser's storage
                </li>
                <li>
                  <strong>Backup:</strong> You can create backups to Google Drive for data portability
                </li>
                <li>
                  <strong>Opt-out:</strong> You can disable Google Analytics by using browser extensions or settings
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Google Services</h3>
                <p>
                  MapleHub integrates with Google services:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li><strong>Google Analytics:</strong> For usage analytics and performance monitoring</li>
                  <li><strong>Google Drive API:</strong> For data backup and restore functionality</li>
                </ul>
                <p className="mt-2 text-sm text-muted-foreground">
                  These services are subject to Google's Privacy Policy and Terms of Service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2">
                <li>Local storage data persists until you clear your browser data</li>
                <li>Google Drive backups remain until you delete them from your Drive</li>
                <li>Google Analytics data is retained according to Google's policies</li>
                <li>We do not maintain copies of your data on our servers</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                MapleHub is not intended for children under 13. We do not knowingly collect 
                personal information from children under 13. If you are a parent or guardian 
                and believe your child has provided us with personal information, please 
                contact us.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of 
                any changes by posting the new Privacy Policy on this page and updating the 
                "Last updated" date. You are advised to review this Privacy Policy periodically 
                for any changes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Discord: <a href="https://discord.gg/DykSm9Pd9D" className="text-primary hover:underline">MapleHub Discord Server</a></li>
                <li>GitHub: <a href="https://github.com/liorzaguri/maplehub" className="text-primary hover:underline">MapleHub Repository</a></li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-center">
          <Button 
            onClick={() => window.location.href = "/maplehub/"} 
            className="btn-hero"
          >
            <Home className="h-4 w-4 mr-2" />
            Return to MapleHub
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
