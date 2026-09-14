using HelpdeskAPI.Data;
using HelpdeskAPI.DTOs;
using HelpdeskAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using HelpdeskAPI.Hubs;

namespace HelpdeskAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ComplaintsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<ComplaintHub> _hubContext;

        public ComplaintsController(AppDbContext context, IHubContext<ComplaintHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllComplaints()
        {
            try
            {
                var userRole = User.FindFirstValue(ClaimTypes.Role);
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userIdStr))
                {
                    return Unauthorized();
                }

                if (userRole == "Admin")
                {
                    var allComplaints = await _context.Complaints.ToListAsync();
                    return Ok(allComplaints);
                }
                else
                {
                    int userId = int.Parse(userIdStr);
                    var userComplaints = await _context.Complaints
                        .Where(c => c.UserId == userId)
                        .ToListAsync();
                    return Ok(userComplaints);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateComplaint(CreateComplaintDto request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr))
            {
                return Unauthorized();
            }
            var userId = int.Parse(userIdStr);

            var complaint = new Complaint
            {
                Title = request.Title,
                Description = request.Description,
                UserId = userId,
                Status = "Pending" 
            };

            _context.Complaints.Add(complaint);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveNewComplaint", complaint);

            return Ok(new { message = "Complaint registered Successfully" });
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")] // Restricted to Admin only
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateDto model)
        {
            try
            {
                var complaint = await _context.Complaints.FindAsync(id);
                if (complaint == null)
                {
                    return NotFound("Complaint not found");
                }

                complaint.Status = model.Status;

                if (!string.IsNullOrEmpty(model.Solution))
                {
                    complaint.Solution = model.Solution;
                }

                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.SendAsync("ReceiveStatusUpdate", complaint);

                return Ok(complaint);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> DeleteComplaint(int id)
        {
            try
            {
                var complaint = await _context.Complaints.FindAsync(id);
                if (complaint == null)
                {
                    return NotFound(new { message = "Complaint Not Found" });
                }

                _context.Complaints.Remove(complaint);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Complaint Deleted Successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }

        [HttpGet("{id}/ai-solution")]
        public async Task<IActionResult> GetAiSolution(int id)
        {
            try
            {
                var complaint = await _context.Complaints.FindAsync(id);
                if (complaint == null)
                {
                    return NotFound(new { message = "Complaint Not Found" });
                }

                await Task.Delay(1500);

                string aiResponse = $"Based on the issue '{complaint.Title}':\n\n" +
                                    "Try these troubleshooting steps:\n" +
                                    "1. Ensure the system or software is fully updated.\n" +
                                    "2. Restart the device or service related to the issue.\n" +
                                    "3. Check for any network connectivity issues.\n" +
                                    "4. If the issue persists, verify user permissions or check logs.";

                return Ok(new { solution = aiResponse });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }
    }

    public class StatusUpdateDto
    {
        public string Status { get; set; }
        public string? Solution { get; set; }
    }
}