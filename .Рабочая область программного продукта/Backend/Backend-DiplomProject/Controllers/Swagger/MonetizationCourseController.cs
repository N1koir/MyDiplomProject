using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_DiplomProject.Models;
using Backend_DiplomProject;

namespace Backend_DiplomProject.Controllers.Swagger;

[Route("api/[controller]")]
[ApiController]
public class MonetizationCourseController : ControllerBase
{
    private readonly AppDbContext _context;

    public MonetizationCourseController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MonetizationCourse>>> GetAll()
        => await _context.MonetizationCourses.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<MonetizationCourse>> GetById(int id)
    {
        var item = await _context.MonetizationCourses.FindAsync(id);
        return item == null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<MonetizationCourse>> Create(MonetizationCourse item)
    {
        _context.MonetizationCourses.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.idmonetizationcourse }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, MonetizationCourse item)
    {
        if (id != item.idmonetizationcourse) return BadRequest();

        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.MonetizationCourses.FindAsync(id);
        if (item == null) return NotFound();

        _context.MonetizationCourses.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}