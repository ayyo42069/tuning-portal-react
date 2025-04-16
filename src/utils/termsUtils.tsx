// Remove "use client" directive as we're now exporting static data
// that can be used in both client and server components

export interface TermsSection {
  title: string;
  paragraphs: string[];
}

export interface TermsOfService {
  lastUpdated: string;
  sections: TermsSection[];
}

// Export static terms of service content
export const termsOfService: TermsOfService = {
  lastUpdated: "May 15, 2023",
  sections: [
    {
      title: "1. Introduction",
      paragraphs: [
        "Welcome to Tuning Portal. These Terms of Service ('Terms') govern your access to and use of the Tuning Portal website, services, and applications (collectively, the 'Service'). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service."
      ]
    },
    {
      title: "2. Definitions",
      paragraphs: [
        "'User' refers to any individual who accesses or uses the Service, including registered account holders.",
        "'Content' refers to any information, data, text, software, graphics, messages, or other materials that are uploaded, posted, or otherwise transmitted through the Service.",
        "'Tuning Files' refers to the electronic files containing vehicle engine control unit (ECU) data that are uploaded, modified, or downloaded through the Service."
      ]
    },
    {
      title: "3. Account Registration and Security",
      paragraphs: [
        "To access certain features of the Service, you must register for an account. When you register, you agree to provide accurate, current, and complete information about yourself. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify Tuning Portal of any unauthorized use of your account or any other breach of security.",
        "Account registration requires email verification. You agree to provide a valid email address and to complete the verification process as instructed. Unverified accounts may have limited functionality."
      ]
    },
    {
      title: "4. Service Description and Credits",
      paragraphs: [
        "Tuning Portal provides automotive tuning services, including but not limited to ECU file analysis, modification, and optimization. Access to certain services requires the use of credits, which can be purchased through the Service. Credits are non-refundable and non-transferable unless otherwise specified.",
        "The Service operates on a credit-based system. Users purchase credits that can be redeemed for specific tuning services. The cost in credits for each service is clearly displayed before purchase. Tuning Portal reserves the right to modify the credit cost of services at any time."
      ]
    },
    {
      title: "5. Limitation of Liability",
      paragraphs: [
        "IN NO EVENT SHALL TUNING PORTAL, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.",
        "TUNING PORTAL SPECIFICALLY DISCLAIMS ANY LIABILITY FOR ANY DAMAGES TO YOUR VEHICLE OR OTHER PROPERTY RESULTING FROM THE USE OF TUNING FILES OBTAINED THROUGH THE SERVICE. YOU ACKNOWLEDGE THAT VEHICLE MODIFICATIONS MAY VOID MANUFACTURER WARRANTIES AND COULD POTENTIALLY CAUSE DAMAGE TO YOUR VEHICLE IF IMPROPERLY APPLIED."
      ]
    },
    {
      title: "6. Governing Law",
      paragraphs: [
        "These Terms shall be governed and construed in accordance with the laws of the European Union and applicable local laws, without regard to its conflict of law provisions."
      ]
    },
    {
      title: "7. Contact Us",
      paragraphs: [
        "If you have any questions about these Terms, please contact us at support@tuning-portal.eu."
      ]
    }
  ]
};

// Function to convert terms to HTML for display
export function getTermsContent(): string {
  let html = `<div class="terms-content">`;
  html += `<p class="text-sm text-gray-500 mb-4">Last Updated: ${termsOfService.lastUpdated}</p>`;
  
  termsOfService.sections.forEach(section => {
    html += `<h3 class="text-lg font-semibold mt-6 mb-3">${section.title}</h3>`;
    
    section.paragraphs.forEach(paragraph => {
      html += `<p class="mb-4">${paragraph}</p>`;
    });
  });
  
  html += `</div>`;
  return html;
}
