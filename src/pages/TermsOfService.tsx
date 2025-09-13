import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Layout from "@/components/Layout";

const TermsOfService = () => {
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
            Terms of Service
          </h1>
          <p className="text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agreement to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By accessing and using MapleHub ("the Service"), you accept and agree to be bound 
                by the terms and provision of this agreement. If you do not agree to abide by the 
                above, please do not use this service.
              </p>
              <p>
                These Terms of Service ("Terms") govern your use of MapleHub, a web-based 
                MapleStory toolkit application.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                MapleHub is a free web application that provides tools and utilities for 
                MapleStory players, including:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Character roster management</li>
                <li>Boss tracking and completion monitoring</li>
                <li>Task management and progress tracking</li>
                <li>Liberation and Fragment calculators</li>
                <li>VI (V Matrix) tracking</li>
                <li>Mule character management</li>
                <li>Live server status monitoring</li>
                <li>Data backup and restore functionality</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You agree to use MapleHub only for lawful purposes and in accordance with these Terms. You agree not to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to any part of the service</li>
                <li>Interfere with or disrupt the service or servers connected to the service</li>
                <li>Use any automated means to access the service without permission</li>
                <li>Upload or transmit any malicious code, viruses, or harmful content</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Data and Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Data Storage</h3>
                <p>
                  MapleHub stores your data locally in your browser. You are responsible for:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Backing up your data regularly using the provided export features</li>
                  <li>Understanding that data may be lost if browser storage is cleared</li>
                  <li>Managing your Google Drive backups if you choose to use that feature</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Data Accuracy</h3>
                <p>
                  You are responsible for the accuracy of the data you input into MapleHub. 
                  We are not responsible for any consequences resulting from inaccurate data entry.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Privacy</h3>
                <p>
                  Your privacy is important to us. Please review our Privacy Policy to understand 
                  how we collect, use, and protect your information.
                </p>
              </div>
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
                  MapleHub integrates with Google services including Google Drive and Google Analytics. 
                  Your use of these services is subject to Google's Terms of Service and Privacy Policy.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">External Links</h3>
                <p>
                  MapleHub may contain links to external websites. We are not responsible for the 
                  content, privacy policies, or practices of these external sites.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2">
                <li>MapleHub is provided "as is" without warranties of any kind</li>
                <li>We do not guarantee uninterrupted or error-free service</li>
                <li>We reserve the right to modify or discontinue the service at any time</li>
                <li>We are not responsible for any downtime or service interruptions</li>
                <li>Server status information is provided for informational purposes only</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">MapleHub Content</h3>
                <p>
                  The MapleHub application, including its design, code, and functionality, is 
                  protected by intellectual property laws. You may not copy, modify, or distribute 
                  the application without permission.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">MapleStory Content</h3>
                <p>
                  MapleHub is a fan-made tool for MapleStory. MapleStory is a trademark of Nexon. 
                  This application is not affiliated with or endorsed by Nexon.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">User Content</h3>
                <p>
                  You retain ownership of any data you input into MapleHub. By using the service, 
                  you grant us a limited license to process and store your data as necessary to 
                  provide the service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To the maximum extent permitted by law, MapleHub and its developers shall not be 
                liable for any indirect, incidental, special, consequential, or punitive damages, 
                including but not limited to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Loss of data or game progress</li>
                <li>Loss of profits or business opportunities</li>
                <li>Service interruptions or downtime</li>
                <li>Errors or inaccuracies in calculations or data</li>
                <li>Any damages resulting from the use or inability to use the service</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disclaimer of Warranties</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                MapleHub is provided on an "as is" and "as available" basis. We make no 
                representations or warranties of any kind, express or implied, regarding the 
                service, including but not limited to warranties of merchantability, fitness 
                for a particular purpose, or non-infringement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Indemnification</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                You agree to indemnify and hold harmless MapleHub and its developers from any 
                claims, damages, or expenses arising from your use of the service or violation 
                of these Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may terminate or suspend your access to MapleHub immediately, without prior 
                notice, for any reason, including if you breach these Terms.
              </p>
              <p>
                Upon termination, your right to use the service will cease immediately. 
                You are responsible for backing up any data you wish to retain.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users 
                of any material changes by updating the "Last updated" date. Your continued 
                use of the service after such changes constitutes acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Governing Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                These Terms shall be governed by and construed in accordance with applicable 
                laws, without regard to conflict of law principles.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you have any questions about these Terms of Service, please contact us:
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

export default TermsOfService;
