using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mime;
using System.Text.Json;
using System.Threading.Tasks;
using Jellyfin.Plugin.NewReviewPlugin.Configuration;
using Jellyfin.Plugin.NewReviewPlugin.Data;
using Jellyfin.Plugin.NewReviewPlugin.Models;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Controller.Library;
// using MediaBrowser.Controller.Notifications;
using MediaBrowser.Model.Activity;
// using MediaBrowser.Model.Notifications;
using MediaBrowser.Model.Users;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Jellyfin.Plugin.NewReviewPlugin.Api
{
    [ApiController]
    [Route("api/NewReviewPlugin")]
    public class RatingsController : ControllerBase
    {
        private readonly RatingRepository _repository;
        private readonly IActivityManager _activityManager;
        // private readonly INotificationManager _notificationManager;
        private readonly IUserManager _userManager;
        private readonly ILogger<RatingsController> _logger;

        public RatingsController(
            IApplicationPaths appPaths, 
            IActivityManager activityManager, 
            // INotificationManager notificationManager,
            IUserManager userManager,
            ILogger<RatingsController> logger)
        {
            _repository = new RatingRepository(appPaths);
            _activityManager = activityManager;
            // _notificationManager = notificationManager;
            _userManager = userManager;
            _logger = logger;
        }

        [HttpPost("Rate")]
        [Produces(MediaTypeNames.Application.Json)]
        public async Task<ActionResult> RateItem([FromQuery] Guid itemId, [FromQuery] Guid userId, [FromQuery] int rating, [FromQuery] string? note, [FromQuery] string? userName)
        {
            try
            {
                if (rating < 1 || rating > 5)
                {
                    return BadRequest(new { success = false, message = "Rating must be between 1 and 5" });
                }

                var userRating = new UserRating
                {
                    ItemId = itemId,
                    UserId = userId,
                    Rating = rating,
                    Note = note,
                    Timestamp = DateTime.UtcNow,
                    UserName = userName ?? "Unknown"
                };

                _repository.SaveRating(userRating);

                /*
                // Activity Log
                try
                {
                    await _activityManager.CreateAsync(new ActivityLogEntry(
                        $"Usuario {userRating.UserName} calificó el item {itemId} con {rating} estrellas",
                        "UserRating",
                        userId)
                    {
                        Overview = !string.IsNullOrEmpty(note) ? $"Reseña: {note}" : null,
                        Date = DateTime.UtcNow,
                        ItemId = itemId.ToString(),
                        Severity = LogLevel.Information
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error creating activity log");
                }
                */

                /*
                // Admin Notification
                if (Plugin.Instance!.Configuration.EnableNotifications && !string.IsNullOrWhiteSpace(note))
                {
                    try
                    {
                        var adminUsers = _userManager.GetUsers(new UserQuery { IsAdministrator = true });
                        
                        foreach (var admin in adminUsers)
                        {
                            await _notificationManager.SendNotification(new NotificationRequest
                            {
                                Name = "Nueva Reseña Publicada",
                                Description = $"{userRating.UserName} ha publicado una reseña de {rating} estrellas.\n\n\"{note}\"",
                                Date = DateTime.UtcNow,
                                Level = NotificationLevel.Normal,
                                Url = "",
                                UserIds = new List<Guid> { admin.Id }
                            }, System.Threading.CancellationToken.None);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error sending notification");
                    }
                }
                */

                return Ok(new { success = true, message = "Rating saved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving rating");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("Export")]
        [Produces(MediaTypeNames.Application.Json)]
        public ActionResult ExportRatings()
        {
            try
            {
                var ratings = _repository.GetAllRatings();
                var json = JsonSerializer.Serialize(ratings, new JsonSerializerOptions { WriteIndented = true });
                return File(System.Text.Encoding.UTF8.GetBytes(json), "application/json", "reviews_export.json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("Item/{itemId}")]
        [Produces(MediaTypeNames.Application.Json)]
        public ActionResult GetItemRatings(Guid itemId)
        {
            try
            {
                var ratings = _repository.GetRatingsForItem(itemId);
                var stats = _repository.GetStatsForItem(itemId);

                return Ok(new
                {
                    success = true,
                    ratings = ratings.Select(r => new
                    {
                        userId = r.UserId,
                        userName = r.UserName,
                        rating = r.Rating,
                        note = r.Note,
                        timestamp = r.Timestamp
                    }),
                    averageRating = stats.AverageRating,
                    totalRatings = stats.TotalRatings
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("MyRating/{itemId}")]
        [Produces(MediaTypeNames.Application.Json)]
        public ActionResult GetMyRating(Guid itemId, [FromQuery] Guid userId)
        {
            try
            {
                var rating = _repository.GetRating(itemId, userId);

                if (rating == null)
                {
                    return Ok(new { success = true, rating = (int?)null });
                }

                return Ok(new
                {
                    success = true,
                    rating = rating.Rating,
                    note = rating.Note,
                    timestamp = rating.Timestamp
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("Rating")]
        [Produces(MediaTypeNames.Application.Json)]
        public ActionResult DeleteRating([FromQuery] Guid itemId, [FromQuery] Guid userId)
        {
            try
            {
                _repository.DeleteRating(itemId, userId);
                return Ok(new { success = true, message = "Rating deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
