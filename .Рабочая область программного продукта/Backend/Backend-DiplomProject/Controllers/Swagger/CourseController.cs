using Backend_DiplomProject.Models;
using Backend_DiplomProject;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend_DiplomProject.Controllers.Swagger;

[Route("api/[controller]")]
[ApiController]
public class CourseController : ControllerBase
{
    private readonly AppDbContext _context;

    public CourseController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Course>>> GetCourses()
    {
        return await _context.Courses
            .Include(c => c.User)
            .Include(c => c.Monetization)
            .Include(c => c.Level)
            .Include(c => c.Category)
            .Include(c => c.Age)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Course>> GetCourse(long id)
    {
        var course = await _context.Courses
            .Include(c => c.User)
            .Include(c => c.Monetization)
            .Include(c => c.Level)
            .Include(c => c.Category)
            .Include(c => c.Age)
            .FirstOrDefaultAsync(c => c.Idcourse == id);

        if (course == null)
        {
            return NotFound();
        }

        return course;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCourse(long id, Course course)
    {
        if (id != course.Idcourse) return BadRequest();

        _context.Entry(course).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourse(long id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return NotFound();

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}