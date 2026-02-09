using System.Text.Json;
using Jellyfin.Plugin.UserRatings.Data;
using Jellyfin.Plugin.UserRatings.Models;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Model.Activity;
using Microsoft.AspNetCore.Mvc;

namespace Jellyfin.Plugin.UserRatings.Api
{
    [ApiController]
    [Route("api/UserRatings")]
    public class RatingsController : ControllerBase
    {
        private readonly RatingRepository _repository;
        private readonly IActivityManager _activityManager;

        public RatingsController(IApplicationPaths appPaths, IActivityManager activityManager)
        {
            _repository = new RatingRepository(appPaths);
            _activityManager = activityManager;
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

                try
                {
                    await _activityManager.CreateAsync(new ActivityLogEntry
                    {
                        Name = $"User {userRating.UserName} rated item {itemId} with {rating} stars",
                        Overview = !string.IsNullOrEmpty(note) ? $"Review: {note}" : null,
                        Date = DateTime.UtcNow,
                        UserId = userId,
                        ItemId = itemId.ToString(),
                        Type = "UserRating",
                        Severity = MediaBrowser.Model.Logging.LogSeverity.Info
                    });
                }
                catch
                {
                    // Ignore activity log errors
                }

                return Ok(new { success = true, message = "Rating saved successfully" });
            }
            catch (Exception ex)
            {
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
                return File(System.Text.Encoding.UTF8.GetBytes(json), "application/json", "user_ratings_export.json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("Import")]
        public async Task<ActionResult> ImportRatings()
        {
            try
            {
                using var reader = new StreamReader(Request.Body);
                var json = await reader.ReadToEndAsync();
                var ratings = JsonSerializer.Deserialize<List<UserRating>>(json);

                if (ratings != null && ratings.Any())
                {
                    _repository.ImportRatings(ratings);
                    return Ok(new { success = true, message = $"Successfully imported {ratings.Count} ratings" });
                }

                return BadRequest(new { success = false, message = "No ratings found in import file" });
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

        [HttpGet("User/{userId}")]
        [Produces(MediaTypeNames.Application.Json)]
        public ActionResult GetUserRatings(Guid userId)
        {
            try
            {
                var ratings = _repository.GetRatingsForUser(userId);

                return Ok(new
                {
                    success = true,
                    ratings = ratings.Select(r => new
                    {
                        itemId = r.ItemId,
                        rating = r.Rating,
                        note = r.Note,
                        timestamp = r.Timestamp
                    })
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

        [HttpDelete("DeleteAll")]
        [Produces(MediaTypeNames.Application.Json)]
        public ActionResult DeleteAllRatings()
        {
            try
            {
                _repository.DeleteAllRatings();

                return Ok(new { success = true, message = "All ratings have been deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("AllRatedItems")]
        [Produces(MediaTypeNames.Application.Json)]
        public ActionResult GetAllRatedItems()
        {
            try
            {
                var ratedItems = _repository.GetAllRatedItems();

                return Ok(new
                {
                    success = true,
                    items = ratedItems.Select(item => new
                    {
                        itemId = item.ItemId,
                        averageRating = item.AverageRating,
                        totalRatings = item.TotalRatings,
                        lastRated = item.LastRated
                    })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}

