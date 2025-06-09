import { type SchemaTypeDefinition } from "sanity";

import { author } from "@/sanity/schemaTypes/author";
import { startup } from "@/sanity/schemaTypes/startup";
import { playlist } from "@/sanity/schemaTypes/playlist";
import { userProfile } from "@/sanity/schemaTypes/userProfile";
import { event } from "@/sanity/schemaTypes/event";
import { eventRsvp } from "@/sanity/schemaTypes/eventRsvp";
import { resourceCategory } from "@/sanity/schemaTypes/resourceCategory";
import { resource } from "@/sanity/schemaTypes/resource";
import { resourceDownload } from "@/sanity/schemaTypes/resourceDownload";
import { resourceRating } from "@/sanity/schemaTypes/resourceRating";
import fundingRound from "@/sanity/schemaTypes/fundingRound";
import pitch from "@/sanity/schemaTypes/pitch";
import pitchRating from "@/sanity/schemaTypes/pitchRating";
import pitchComment from "@/sanity/schemaTypes/pitchComment";
import investorProfile from "@/sanity/schemaTypes/investorProfile";
import investmentInterest from "@/sanity/schemaTypes/investmentInterest";
import connectionRequest from "@/sanity/schemaTypes/connectionRequest";
import userInteraction from "@/sanity/schemaTypes/userInteraction";
import matchingScore from "@/sanity/schemaTypes/matchingScore";
import recommendation from "@/sanity/schemaTypes/recommendation";
import message from "@/sanity/schemaTypes/message";
import conversation from "@/sanity/schemaTypes/conversation";
import communityVote from "@/sanity/schemaTypes/communityVote";
import discussionForum from "@/sanity/schemaTypes/discussionForum";
import forumPost from "@/sanity/schemaTypes/forumPost";
import startupReview from "@/sanity/schemaTypes/startupReview";
import sponsor from "@/sanity/schemaTypes/sponsor";
import sponsorship from "@/sanity/schemaTypes/sponsorship";
import startupCommunity from "@/sanity/schemaTypes/startupCommunity";
import communityPost from "@/sanity/schemaTypes/communityPost";
import communityComment from "@/sanity/schemaTypes/communityComment";
import communityReaction from "@/sanity/schemaTypes/communityReaction";
import communityMember from "@/sanity/schemaTypes/communityMember";
import { startupFollow } from "@/sanity/schemaTypes/startupFollow";
import { startupLove } from "@/sanity/schemaTypes/startupLove";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    author,
    startup,
    playlist,
    userProfile,
    event,
    eventRsvp,
    resourceCategory,
    resource,
    resourceDownload,
    resourceRating,
    fundingRound,
    pitch,
    pitchRating,
    pitchComment,
    investorProfile,
    investmentInterest,
    connectionRequest,
    userInteraction,
    matchingScore,
    recommendation,
    message,
    conversation,
    communityVote,
    discussionForum,
    forumPost,
    startupReview,
    sponsor,
    sponsorship,
    startupCommunity,
    communityPost,
    communityComment,
    communityReaction,
    communityMember,
    startupFollow,
    startupLove
  ],
};
