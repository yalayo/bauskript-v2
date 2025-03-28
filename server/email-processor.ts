import { storage } from './storage';
import { sendEmail, getGmailService, getUserInfo } from './gmail';
import { Email } from '@shared/schema';

// Processing interval in ms (220 seconds = 3.67 minutes)
const PROCESSING_INTERVAL = 220 * 1000;

// Processing timers for each campaign
const campaignTimers: Record<number, NodeJS.Timeout> = {};

/**
 * Start processing for a campaign
 */
export async function startCampaignProcessing(campaignId: number): Promise<void> {
  // Check if a timer is already running for this campaign
  if (campaignTimers[campaignId]) {
    console.log(`Processing already started for campaign ${campaignId}`);
    return;
  }

  console.log(`Starting processing for campaign ${campaignId}...`);
  
  // Get the campaign to verify it exists and is in a runnable state
  const campaign = await storage.getEmailCampaign(campaignId);
  if (!campaign) {
    console.error(`Campaign ${campaignId} not found`);
    return;
  }
  
  if (campaign.status !== 'running') {
    console.error(`Campaign ${campaignId} is not in running state (${campaign.status})`);
    return;
  }
  
  // Get the user who created the campaign for Gmail auth
  const user = await storage.getUser(campaign.createdBy);
  if (!user) {
    console.error(`User not found for campaign ${campaignId}`);
    return;
  }
  
  // Verify Gmail authentication before starting
  try {
    // Check if the user has Gmail credentials
    if (!user.googleAccessToken) {
      console.error(`User ${user.id} does not have Gmail credentials`);
      await storage.updateEmailCampaign(campaignId, { 
        status: 'paused',
        statusMessage: 'Gmail authentication required'
      });
      return;
    }
    
    // Try to get Gmail service to verify token is valid
    await getGmailService(user);
    
    // Check quota limits
    try {
      const quotaInfo = await getUserInfo(user.googleAccessToken);
      console.log(`Gmail authenticated for user ${user.id} (${quotaInfo.email})`);
    } catch (error) {
      console.error(`Error checking Gmail user info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`Gmail authentication error for user ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    await storage.updateEmailCampaign(campaignId, { 
      status: 'paused',
      statusMessage: 'Gmail authentication failed. Please reconnect Gmail account.'
    });
    return;
  }
  
  // Start the campaign processing
  processNextEmail(campaignId);
  
  // Set up the interval for scheduled processing
  campaignTimers[campaignId] = setInterval(() => {
    processNextEmail(campaignId);
  }, PROCESSING_INTERVAL);
  
  console.log(`Started processing timer for campaign ${campaignId}`);
}

/**
 * Stop processing for a campaign
 */
export function stopCampaignProcessing(campaignId: number): void {
  if (campaignTimers[campaignId]) {
    clearInterval(campaignTimers[campaignId]);
    delete campaignTimers[campaignId];
    console.log(`Stopped processing timer for campaign ${campaignId}`);
  }
}

/**
 * Process the next email in the campaign
 */
async function processNextEmail(campaignId: number): Promise<void> {
  console.log(`Processing next email for campaign ${campaignId}...`);
  
  try {
    // Get the campaign
    const campaign = await storage.getEmailCampaign(campaignId);
    if (!campaign) {
      console.error(`Campaign ${campaignId} not found`);
      stopCampaignProcessing(campaignId);
      return;
    }
    
    // Check if campaign is still in running state
    if (campaign.status !== 'running') {
      console.log(`Campaign ${campaignId} is no longer running (${campaign.status})`);
      stopCampaignProcessing(campaignId);
      return;
    }
    
    // Get the user who created the campaign for Gmail auth
    const user = await storage.getUser(campaign.createdBy);
    if (!user) {
      console.error(`User not found for campaign ${campaignId}`);
      stopCampaignProcessing(campaignId);
      return;
    }
    
    // Check if the user has Gmail credentials
    if (!user.googleAccessToken) {
      console.error(`User ${user.id} does not have Gmail credentials`);
      await storage.updateEmailCampaign(campaignId, { 
        status: 'paused',
        statusMessage: 'Gmail authentication required'
      });
      stopCampaignProcessing(campaignId);
      return;
    }
    
    // Get processing info to find current contact
    const processingInfo = await storage.getCampaignProcessingInfo(campaignId);
    
    if (!processingInfo.currentContact) {
      console.log(`No more contacts to process for campaign ${campaignId}`);
      // Mark campaign as completed
      await storage.updateEmailCampaign(campaignId, { 
        status: 'completed',
        statusMessage: 'All contacts processed'
      });
      stopCampaignProcessing(campaignId);
      return;
    }
    
    // Create a Gmail service
    try {
      const gmail = await getGmailService(user);
      
      // Get the contact for personalization
      const contact = await storage.getContact(processingInfo.currentContact.id);
      if (!contact) {
        console.error(`Contact ${processingInfo.currentContact.id} not found`);
        // Skip to next contact
        await storage.markContactAsProcessed(processingInfo.currentContact.id);
        return;
      }
      
      // Personalize the email content
      let personalizedSubject = campaign.subject;
      let personalizedContent = campaign.content;
      
      // Replace placeholders with contact data
      const placeholders: Record<string, string> = {
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        email: contact.email,
        company: contact.company || '',
        position: contact.position || '',
        category: contact.category || '',
      };
      
      // Apply personalization to subject and content
      Object.entries(placeholders).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        personalizedSubject = personalizedSubject.replace(new RegExp(placeholder, 'g'), value);
        personalizedContent = personalizedContent.replace(new RegExp(placeholder, 'g'), value);
      });
      
      // Send the email
      await sendEmail(user, {
        to: contact.email,
        subject: personalizedSubject,
        html: personalizedContent
      });
      
      console.log(`Sent email to ${contact.email} for campaign ${campaignId}`);
      
      // Create an email record
      const email = await storage.createEmail({
        campaignId,
        contactId: contact.id,
        subject: personalizedSubject,
        content: personalizedContent,
        status: 'sent',
        sentAt: new Date(),
        direction: 'outbound'
      });
      
      // Update campaign stats
      await storage.updateEmailCampaign(campaignId, {
        sentCount: (campaign.sentCount || 0) + 1
      });
      
      // Mark contact as processed
      await storage.markContactAsProcessed(processingInfo.currentContact.id);
      
      console.log(`Successfully processed contact ${contact.id} for campaign ${campaignId}`);
      
    } catch (error) {
      console.error(`Error sending email for campaign ${campaignId}:`, error);
      
      // If there's a token error, pause the campaign
      if (error instanceof Error && error.message.includes('token')) {
        await storage.updateEmailCampaign(campaignId, { 
          status: 'paused',
          statusMessage: 'Gmail authentication expired'
        });
        stopCampaignProcessing(campaignId);
      }
    }
    
  } catch (error) {
    console.error(`Error processing email for campaign ${campaignId}:`, error);
  }
}

/**
 * Initialize email processing for all running campaigns
 */
export async function initializeEmailProcessing(): Promise<void> {
  try {
    // Find all running campaigns
    const campaigns = await storage.getEmailCampaigns();
    const runningCampaigns = campaigns.filter(c => c.status === 'running');
    
    console.log(`Found ${runningCampaigns.length} running campaigns to initialize`);
    
    // Start processing for each running campaign
    for (const campaign of runningCampaigns) {
      await startCampaignProcessing(campaign.id);
    }
    
    // Make sure stopped campaigns stay stopped
    const stoppedCampaigns = campaigns.filter(c => c.status === 'stopped');
    for (const campaign of stoppedCampaigns) {
      // Ensure the timer is cleared if it exists
      stopCampaignProcessing(campaign.id);
      console.log(`Ensuring stopped campaign ${campaign.id} remains stopped`);
    }
  } catch (error) {
    console.error('Error initializing email processing:', error);
  }
}