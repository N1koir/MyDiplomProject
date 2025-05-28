using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_DiplomProject.Models;
using Backend_DiplomProject;

namespace Backend_DiplomProject.Controllers.Swagger;

[Route("api/[controller]")]
[ApiController]
public class LevelKnowledgeController : ControllerBase
{
    private readonly AppDbContext _context;

    public LevelKnowledgeController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LevelKnowledge>>> GetAll()
        => await _context.LevelKnowledges.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<LevelKnowledge>> GetById(int id)
    {
        var item = await _context.LevelKnowledges.FindAsync(id);
        return item == null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<LevelKnowledge>> Create(LevelKnowledge item)
    {
        _context.LevelKnowledges.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Idlevelknowledge }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, LevelKnowledge item)
    {
        if (id != item.Idlevelknowledge) return BadRequest();

        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.LevelKnowledges.FindAsync(id);
        if (item == null) return NotFound();

        _context.LevelKnowledges.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}