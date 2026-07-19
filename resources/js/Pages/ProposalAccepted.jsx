import React from 'react';
import { Head } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';

export default function ProposalAccepted({ proposal, alreadyAccepted }) {
  return (
    <>
      <Head title="Proposal Accepted" />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              {alreadyAccepted ? 'Proposal Already Accepted' : 'Proposal Accepted!'}
            </h1>

            <p className="text-muted-foreground mb-4">
              {alreadyAccepted
                ? `Proposal ${proposal.number} was already accepted. No further action needed.`
                : `Thank you! Proposal ${proposal.number} has been accepted. Our team will be in touch shortly to kick things off.`
              }
            </p>

            <div className="bg-muted/50 rounded-lg p-4 text-left mt-6">
              <p className="text-sm text-muted-foreground">Proposal</p>
              <p className="text-foreground font-medium">{proposal.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{proposal.number}</p>
            </div>

            <a
              href="/"
              className="inline-block mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Visit Our Website
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
