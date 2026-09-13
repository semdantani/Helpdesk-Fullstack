using HelpdeskAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpdeskAPI.Data
{
    public class AppDbContext:DbContext
    {
       public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Complaint> Complaints { get; set; }
    }
}
