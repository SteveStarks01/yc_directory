# Community Feature Testing Guide

## Full End-to-End Community Flow Test

### Phase 1: Community Creation
1. **Navigate to Homepage**: http://localhost:3000
2. **Sign In**: Click "Login" button and authenticate with Clerk
3. **Find a Startup**: Look for startup cards on the homepage
4. **Create Community**: Click "Create Community" button on any startup card
5. **Fill Community Form**: 
   - Community Name: "Test Community"
   - Description: "This is a test community for our startup"
   - Set as Public
   - Allow Guest Posts: Yes
6. **Submit**: Click "Create Community" button
7. **Verify Redirect**: Should redirect to community page

### Phase 2: Community Interface Testing
1. **Community Header**: Verify startup info, member count, post count
2. **Tab Navigation**: Test Feed, Members, Events, Analytics tabs
3. **Community Settings**: If founder, verify management options

### Phase 3: Post Creation & Social Features
1. **Post Composer**: 
   - Write a test post: "Hello from our startup community! 🚀"
   - Test character counter
   - Try adding emojis
   - Test file attachment (optional)
2. **Submit Post**: Click "Post" button
3. **Verify Post Display**: Post should appear in feed immediately

### Phase 4: Social Interaction Testing
1. **Reactions**: Test like, love, laugh reactions on posts
2. **Comments**: Click comment button (placeholder for now)
3. **Sharing**: Test share functionality (copies URL)
4. **Feed Refresh**: Test refresh button

### Phase 5: API Endpoint Testing
Test API endpoints directly:

```bash
# Test community creation (requires authentication)
curl -X POST http://localhost:3000/api/communities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Community",
    "description": "Created via API",
    "startupId": "STARTUP_ID_HERE",
    "isPublic": true,
    "allowGuestPosts": true
  }'

# Test post creation (requires authentication)
curl -X POST http://localhost:3000/api/communities/COMMUNITY_ID/posts \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test post from API"
  }'

# Test getting posts
curl http://localhost:3000/api/communities/COMMUNITY_ID/posts
```

## Expected Results

### ✅ Working Features
- [x] Community creation form with validation
- [x] Community interface with tabs
- [x] Post composer with rich features
- [x] Post display with reactions
- [x] Real-time feed updates
- [x] Responsive design
- [x] Authentication integration
- [x] API endpoints for CRUD operations

### 🚧 Placeholder Features (Coming Soon)
- [ ] Comment threading system
- [ ] Real-time notifications
- [ ] File upload to cloud storage
- [ ] Member management
- [ ] Events system
- [ ] Analytics dashboard
- [ ] Advanced moderation tools

## Troubleshooting

### Common Issues
1. **Authentication Errors**: Ensure Clerk is properly configured
2. **API 404 Errors**: Check middleware configuration
3. **Database Errors**: Verify Sanity connection and schemas
4. **TypeScript Errors**: Check component imports and types

### Debug Steps
1. Check browser console for JavaScript errors
2. Check network tab for API request/response
3. Verify database records in Sanity Studio
4. Check server logs for backend errors

## Performance Metrics

### Target Performance
- Community creation: < 2 seconds
- Post creation: < 1 second
- Feed loading: < 3 seconds
- Real-time updates: < 500ms

### Monitoring
- Use React Query DevTools for cache inspection
- Monitor API response times
- Check bundle size impact
- Test mobile responsiveness

## Next Steps

After successful testing:
1. Implement comment threading system
2. Add real-time WebSocket connections
3. Build member management features
4. Create events system
5. Add analytics dashboard
6. Implement advanced moderation tools
7. Add mobile app support
8. Scale for production load
