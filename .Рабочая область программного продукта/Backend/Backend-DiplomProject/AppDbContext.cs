using Backend_DiplomProject.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend_DiplomProject
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Role> Roles { get; set; }
        public DbSet<Username> Usernames { get; set; }
        public DbSet<MonetizationCourse> MonetizationCourses { get; set; }
        public DbSet<LevelKnowledge> LevelKnowledges { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<AgePeople> AgePeoples { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Pages> Pages { get; set; }
        public DbSet<FavoritesAndHistory> FavoritesAndHistories { get; set; }
        public DbSet<Pay> Pays { get; set; }
        public DbSet<TypeSupport> TypeSupports { get; set; }
        public DbSet<TypeStatusSupport> TypeStatusSupports { get; set; }
        public DbSet<Support> Supports { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Username>()
                .HasOne(u => u.Role)
                .WithMany()
                .HasForeignKey(u => u.Idrole)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Course>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.Idusername)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Course>()
                .HasOne(c => c.Monetization)
                .WithMany()
                .HasForeignKey(c => c.Idmonetizationcourse)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Course>()
                .HasOne(c => c.Level)
                .WithMany()
                .HasForeignKey(c => c.Idlevelknowledge)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Course>()
                .HasOne(c => c.Category)
                .WithMany()
                .HasForeignKey(c => c.Idcategory)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Course>()
                .HasOne(c => c.Age)
                .WithMany()
                .HasForeignKey(c => c.Idagepeople)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Pages>()
                .HasOne(p => p.Course)
                .WithMany(c => c.Pages)
                .HasForeignKey(p => p.Idcourse)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FavoritesAndHistory>()
                .HasOne(f => f.Course)
                .WithMany()
                .HasForeignKey(f => f.Idcourse)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FavoritesAndHistory>()
                .HasOne(f => f.User)
                .WithMany()
                .HasForeignKey(f => f.Idusername)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Pay>()
                .HasOne(p => p.Course)
                .WithMany()
                .HasForeignKey(p => p.Idcourse)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Pay>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.Idusername)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TypeStatusSupport>()
               .Property(tss => tss.Type)
               .HasMaxLength(9);

            modelBuilder.Entity<Support>()
                .HasOne(s => s.TypeSupport)
                .WithMany()
                .HasForeignKey(s => s.Idtypesupport)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Support>()
                .HasOne(s => s.Course)
                .WithMany()
                .HasForeignKey(s => s.Idcourse)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Support>()
                .HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.Idusername)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Support>()
                .HasOne(s => s.TypeStatusSupport)
                .WithMany()
                .HasForeignKey(s => s.Idtypestatussupport)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}