namespace HelpdeskAPI.Models
{
    public class Complaint
    {
        public int Id { get; set; } 

        public string Title {  get; set; }=string.Empty;

        public string Description {  get; set; }=string.Empty;

        public string Status { get; set; } = "Pending";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        //Foreign Keys
        public int UserId {  get; set; }

        public User? User { get; set; }

        public int? AssignedToId {  get; set; }
        public string? Solution { get; set; }
    }
}
