
import { StreamChannel } from '../types';
import { getM3UProxy } from './sheetService';
import { M3U_URLS } from '../constants';
import { BACKUP_PLAYLISTS } from '../constants_backup';

// Cache per planId for metadata
const metadataCache: Record<string, StreamChannel[]> = {};

/**
 * STRATEGY:
 * 1. Metadata (List of channels) -> Try fetching live from Backend Proxy (Drive Source).
 * 2. Fallback -> Local .txt files.
 * 3. Stream URL -> Resolved via Backend Proxy only when requested.
 */

export const fetchMetadata = async (planId: string = 'king'): Promise<StreamChannel[]> => {
    // 1. Check Cache
    if (metadataCache[planId] && metadataCache[planId].length > 0) {
        return metadataCache[planId];
    }

    // 2. Try Fetching from Backend Proxy (Source of Truth - Drive)
    try {
        console.log(`[Metadata] Fetching live list for ${planId} from backend...`);
        const proxyContent = await getM3UProxy(planId, 15000); // 15s timeout for metadata load
        
        if (proxyContent && (proxyContent.includes('#EXTM3U') || proxyContent.includes('#EXTINF'))) {
             const parsed = parseM3U(proxyContent, true); // True = Metadata only mode
             if (parsed.length > 0) {
                 console.log(`[Metadata] Loaded ${parsed.length} channels for ${planId} from Drive source.`);
                 metadataCache[planId] = parsed;
                 // Save to local storage as emergency backup
                 localStorage.setItem(`emergency_m3u_${planId}`, JSON.stringify(parsed));
                 return parsed;
             }
        }
    } catch (e) {
        console.warn(`[Metadata] Failed to load live list for ${planId}, trying emergency local storage...`, e);
    }

    // 2.5 Try Emergency Local Storage (Previous successful load)
    const emergency = localStorage.getItem(`emergency_m3u_${planId}`);
    if (emergency) {
        try {
            const parsed = JSON.parse(emergency);
            if (parsed.length > 0) {
                console.log(`[Metadata] Loaded ${parsed.length} channels from emergency local storage.`);
                return parsed;
            }
        } catch(e) {}
    }

    // 3. Fallback to Local File
    try {
        console.log(`[Metadata] Fetching local backup list for ${planId}...`);
        
        const response = await fetch(`./backups/${planId}.txt`);
        if (!response.ok) throw new Error("Local file not found");
        
        const text = await response.text();
        const parsed = parseM3U(text, true); 
        
        if (parsed.length > 0) {
            console.log(`[Metadata] Loaded ${parsed.length} channels for ${planId} from local backup.`);
            metadataCache[planId] = parsed;
            return parsed;
        }
    } catch (e) {
        console.warn(`[Metadata] Failed to load local file for ${planId}, trying hardcoded backup...`, e);
    }

    // 4. Fallback to Hardcoded Backup
    const backupKey = planId as keyof typeof BACKUP_PLAYLISTS;
    if (BACKUP_PLAYLISTS[backupKey]) {
        const parsed = parseM3U(BACKUP_PLAYLISTS[backupKey], true);
        metadataCache[planId] = parsed;
        return parsed;
    }

    return [];
};

export const resolveStreamUrl = async (planId: string, channelName: string): Promise<string | null> => {
    // Determine timeout based on plan
    let timeoutMs = 60000; 
    if (planId === 'premium' || planId === 'vod') {
        timeoutMs = 120000;
    }

    try {
        console.log(`[Resolver] Resolving stream for "${channelName}" in plan ${planId}...`);
        
        // 1. Fetch Real M3U from Backend
        const m3uContent = await getM3UProxy(planId, timeoutMs);
        
        if (!m3uContent || (!m3uContent.includes('#EXTM3U') && !m3uContent.includes('#EXTINF'))) {
            throw new Error("Invalid M3U from backend");
        }

        // 2. Parse and Find
        const channels = parseM3U(m3uContent, false);
        const target = channels.find(ch => ch.name.trim() === channelName.trim());

        if (target && target.url) {
            console.log(`[Resolver] Found URL: ${target.url}`);
            return target.url;
        } else {
            console.warn(`[Resolver] Channel "${channelName}" not found in live M3U.`);
            return null;
        }

    } catch (error) {
        console.error(`[Resolver] Error resolving stream:`, error);
        return null;
    }
};

/**
 * @param content M3U Content
 * @param isMetadata If true, sets a placeholder URL. If false, extracts real URL.
 */
export const parseM3U = (content: string, isMetadata: boolean = false): StreamChannel[] => {
    const lines = content.split('\n');
    const channels: StreamChannel[] = [];
    
    let currentItem: Partial<StreamChannel> = {};

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        if (line.startsWith('#EXTINF:')) {
            // Regex to extract attributes safely
            const logoMatch = line.match(/tvg-logo="([^"]*)"/);
            const groupMatch = line.match(/group-title="([^"]*)"/);
            
            // Name is usually after the last comma
            const nameParts = line.split(',');
            let name = nameParts[nameParts.length - 1].trim();
            
            // Clean up name
            name = name.replace(/"/g, '');

            currentItem = {
                name: name || 'Unknown Channel',
                group: groupMatch ? groupMatch[1] : 'Uncategorized',
                logo: logoMatch ? logoMatch[1] : undefined
            };
        } else if (line.startsWith('http') || line.startsWith('rtmp') || (isMetadata && line.length > 0)) {
            if (currentItem.name) {
                channels.push({
                    name: currentItem.name,
                    group: currentItem.group || 'Uncategorized',
                    logo: currentItem.logo,
                    url: isMetadata ? 'resolve_needed' : line // Placeholder if metadata mode
                });
                currentItem = {}; // Reset for next channel
            }
        }
    }

    return channels;
};
